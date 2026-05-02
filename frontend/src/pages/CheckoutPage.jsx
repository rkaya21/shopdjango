import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createOrder, initiatePayment } from '../api/client'
import { useCart } from '../context/CartContext'

const METHODS = [
  { id: 'credit_card', label: 'Kredi Kartı', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z' },
  { id: 'bank_transfer', label: 'Havale/EFT', icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z' },
  { id: 'cash_on_delivery', label: 'Kapıda Ödeme', icon: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z' },
]

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('credit_card')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!cart || cart.cart_items?.length === 0) navigate('/cart') }, [cart, navigate])

  const fmtCard = (v) => v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19)
  const fmtExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      if (!address.trim()) { setError('Teslimat adresi gerekli.'); return }
      setError(''); setStep(2); return
    }
    setLoading(true); setError('')
    try {
      const orderRes = await createOrder(address)
      const pd = { order_id: orderRes.data.id, method }
      if (method === 'credit_card') {
        pd.card_number = card.number.replace(/\s/g, '')
        pd.card_expiry = card.expiry; pd.card_cvv = card.cvv; pd.card_holder = card.holder
      }
      const payRes = await initiatePayment(pd)
      await fetchCart()
      if (payRes.data.success) navigate('/order-success', { state: { order: orderRes.data, payment: payRes.data.payment } })
      else setError('Ödeme başarısız. Tekrar deneyin.')
    } catch (err) { setError(err.response?.data?.error ?? 'Bir hata oluştu.') }
    finally { setLoading(false) }
  }

  if (!cart || cart.cart_items?.length === 0) return null
  const inputCls = 'w-full border border-surface-200 rounded-xl px-4 py-3 text-sm bg-surface-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all'

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
        <Link to="/cart" className="hover:text-brand-600 transition-colors">Sepet</Link>
        <span>›</span>
        <span className={step===1?'text-surface-700 font-medium':''}>Adres</span>
        <span>›</span>
        <span className={step===2?'text-surface-700 font-medium':''}>Ödeme</span>
      </nav>

      <div className="flex items-center gap-0 mb-8">
        {[1,2].map(s=>(
          <div key={s} className="flex items-center flex-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${step>=s?'bg-surface-900 text-white':'bg-surface-100 text-surface-400'}`}>
              {step>s?'✓':s}
            </div>
            {s<2&&<div className={`flex-1 h-0.5 mx-2 rounded ${step>1?'bg-surface-900':'bg-surface-200'}`}/>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            {step===1&&(
              <div className="bg-white rounded-2xl border border-surface-100 p-6 sm:p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-surface-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">1</div>
                  <div><h2 className="font-semibold text-surface-900">Teslimat Adresi</h2><p className="text-xs text-surface-400">Adresinizi girin</p></div>
                </div>
                <textarea required rows={4} value={address} onChange={e=>setAddress(e.target.value)}
                  placeholder="Mahalle, sokak, bina no, daire no, ilçe, şehir..." className={inputCls+' resize-none'} id="checkout-address-input"/>
              </div>
            )}

            {step===2&&(
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white rounded-2xl border border-surface-100 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-surface-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">2</div>
                    <div><h2 className="font-semibold text-surface-900">Ödeme Yöntemi</h2><p className="text-xs text-surface-400">Nasıl ödeme yapmak istersiniz?</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {METHODS.map(m=>(
                      <button key={m.id} type="button" onClick={()=>setMethod(m.id)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method===m.id?'border-surface-900 bg-surface-50':'border-surface-100 hover:border-surface-200'}`}>
                        <svg className={`w-6 h-6 ${method===m.id?'text-surface-900':'text-surface-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={m.icon}/>
                        </svg>
                        <span className={`text-xs font-medium ${method===m.id?'text-surface-900':'text-surface-500'}`}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {method==='credit_card'&&(
                  <div className="bg-white rounded-2xl border border-surface-100 p-6 sm:p-8 animate-fade-in">
                    <h3 className="font-semibold text-surface-900 mb-5">Kart Bilgileri</h3>
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-surface-700 mb-2">Kart Üzerindeki İsim</label>
                        <input required value={card.holder} onChange={e=>setCard({...card,holder:e.target.value})} placeholder="Ad Soyad" className={inputCls}/></div>
                      <div><label className="block text-sm font-medium text-surface-700 mb-2">Kart Numarası</label>
                        <input required value={card.number} onChange={e=>setCard({...card,number:fmtCard(e.target.value)})} placeholder="0000 0000 0000 0000" maxLength={19} className={inputCls+' tabular-nums tracking-wider'}/></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-sm font-medium text-surface-700 mb-2">Son Kullanma</label>
                          <input required value={card.expiry} onChange={e=>setCard({...card,expiry:fmtExp(e.target.value)})} placeholder="AA/YY" maxLength={5} className={inputCls+' tabular-nums'}/></div>
                        <div><label className="block text-sm font-medium text-surface-700 mb-2">CVV</label>
                          <input required type="password" value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="•••" maxLength={4} className={inputCls}/></div>
                      </div>
                    </div>
                  </div>
                )}

                {method==='bank_transfer'&&(
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 animate-fade-in">
                    <p className="font-medium">Havale/EFT</p><p className="mt-1 text-blue-600">Sipariş sonrası banka bilgileri e-posta ile gönderilecek. (Simülasyon)</p>
                  </div>
                )}
                {method==='cash_on_delivery'&&(
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 animate-fade-in">
                    <p className="font-medium">Kapıda Ödeme</p><p className="mt-1 text-amber-600">Teslimat sırasında kuryeye ödeme yapabilirsiniz.</p>
                  </div>
                )}
              </div>
            )}

            {error&&<div className="mt-4 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm animate-fade-in">{error}</div>}

            <div className="mt-5 flex gap-3">
              {step===2&&<button type="button" onClick={()=>setStep(1)} className="px-5 py-3 rounded-xl text-sm font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 transition-colors">← Geri</button>}
              <button type="submit" disabled={loading}
                className="flex-1 bg-surface-900 text-white py-3.5 rounded-xl font-semibold hover:bg-surface-800 transition-all shadow-lg shadow-surface-900/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading?<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{step===2?'Ödeniyor...':'İşleniyor...'}</>
                  :step===1?'Ödeme Adımına Geç →':'Ödemeyi Tamamla'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24">
            <h3 className="font-semibold text-surface-900 mb-5">Sipariş Özeti</h3>
            <div className="space-y-3 divide-y divide-surface-50">
              {cart.cart_items.map(item=>(
                <div key={item.id} className="flex justify-between pt-3 first:pt-0">
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-surface-800 truncate">{item.product.name}</p><p className="text-xs text-surface-400">× {item.quantity}</p></div>
                  <span className="text-sm font-semibold text-surface-900 tabular-nums ml-3">{Number(item.subtotal).toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between text-sm text-surface-500"><span>Kargo</span><span className="text-emerald-600 font-medium">Ücretsiz</span></div>
            <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between"><span className="font-bold text-surface-900">Toplam</span>
              <span className="text-xl font-extrabold text-surface-900 tabular-nums">{Number(cart.total).toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
