from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer, UserSerializer, AddressSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .models import User, Address


def _set_auth_cookies(response, access_token, refresh_token=None):
    """Access ve opsiyonel olarak refresh token'ı HttpOnly cookie olarak atar."""
    secure = not settings.DEBUG
    response.set_cookie(
        'access_token',
        str(access_token),
        max_age=60 * 60,        # 1 saat
        httponly=True,
        samesite='Lax',
        secure=secure,
        path='/',
    )
    if refresh_token:
        response.set_cookie(
            'refresh_token',
            str(refresh_token),
            max_age=60 * 60 * 24 * 7,  # 7 gün
            httponly=True,
            samesite='Lax',
            secure=secure,
            path='/',
        )


class LoginView(APIView):
    """
    Kullanıcı girişi — JWT token'ları HttpOnly cookie olarak set eder.
    Login endpoint'i rate limit'e tabidir (10/dakika).
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {'detail': 'E-posta veya şifre hatalı.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.user
        refresh = RefreshToken.for_user(user)

        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh.access_token, refresh)
        return response


class TokenRefreshView(APIView):
    """Refresh cookie kullanarak yeni access token üretir."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token bulunamadı.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            token = RefreshToken(refresh_token)
            access = token.access_token
        except TokenError:
            response = Response(
                {'detail': 'Geçersiz veya süresi dolmuş token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response

        response = Response({'detail': 'Token yenilendi.'})
        _set_auth_cookies(response, access)
        return response


class LogoutView(APIView):
    """Cookie'leri temizleyerek çıkış yapar."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({'detail': 'Çıkış yapıldı.'})
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        return response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ── Adres Yönetimi ──

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# ── Şifre İşlemleri ──

class PasswordChangeView(APIView):
    """Giriş yapmış kullanıcı şifre değiştirme."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Şifre başarıyla değiştirildi.'})


class PasswordResetRequestView(APIView):
    """E-posta ile şifre sıfırlama linki gönderir."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Güvenlik: e-posta var mı yok mu belli etme
            return Response({'detail': 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Console backend — gerçek projede e-posta template'i kullanılır
        reset_url = f'http://localhost:3000/reset-password/{uid}/{token}/'
        send_mail(
            subject='ShopDjango — Şifre Sıfırlama',
            message=f'Şifrenizi sıfırlamak için: {reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )

        return Response({'detail': 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi.'})


class PasswordResetConfirmView(APIView):
    """Token ile şifre sıfırlama."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Geçersiz sıfırlama linki.'}, status=400)

        if not default_token_generator.check_token(user, data['token']):
            return Response({'detail': 'Süresi dolmuş veya geçersiz token.'}, status=400)

        user.set_password(data['new_password'])
        user.save()
        return Response({'detail': 'Şifre başarıyla sıfırlandı. Giriş yapabilirsiniz.'})
