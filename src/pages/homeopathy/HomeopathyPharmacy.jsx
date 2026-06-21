import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const remedies = [
  { id:'R001', name:'Arnica Montana 30C', potency:'30C', price:120, stock:true, category:'First Aid' },
  { id:'R002', name:'Nux Vomica 200C', potency:'200C', price:150, stock:true, category:'Digestive' },
  { id:'R003', name:'Rhus Tox 30C', potency:'30C', price:130, stock:true, category:'Joint Pain' },
  { id:'R004', name:'Pulsatilla 30C', potency:'30C', price:110, stock:false, category:'Women Health' },
  { id:'R005', name:'Bryonia Alba 200C', potency:'200C', price:140, stock:true, category:'Respiratory' },
  { id:'R006', name:'Apis Mellifica 30C', potency:'30C', price:125, stock:true, category:'Allergy' },
  { id:'R007', name:'Calendula Mother Tincture', potency:'Q', price:180, stock:true, category:'Skin Care' },
  { id:'R008', name:'Ignatia Amara 200C', potency:'200C', price:135, stock:true, category:'Emotional' },
];

const HomeopathyPharmacy = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');

  const addToCart = (remedy) => {
    setCart([...cart, remedy]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const filteredRemedies = search ? remedies.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase())) : remedies;

  return (
    <div style={{ maxWidth:'1200px',margin:'0 auto',padding:'1rem' }}>
      <button onClick={()=>navigate('/homeopathy')} style={{ padding:'0.5rem 1rem',backgroundColor:'#f1f5f9',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginBottom:'1rem' }}>← Back</button>
      <h1 style={{ fontSize:'1.8rem',fontWeight:'bold',color:'#DC2626',marginBottom:'1rem' }}>💊 Homeopathy Pharmacy</h1>
      <input placeholder="🔍 Search remedies by name or category..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%',padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',marginBottom:'1.5rem' }} />

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))',gap:'1rem' }}>
        {filteredRemedies.map(r=>(
          <div key={r.id} style={{ backgroundColor:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderTop:r.stock?'4px solid #059669':'4px solid #DC2626' }}>
            <h3 style={{ fontWeight:'bold',color:'#1e293b' }}>{r.name}</h3>
            <p style={{ color:'#64748b' }}>Potency: {r.potency} | {r.category}</p>
            <p style={{ fontWeight:'bold',fontSize:'1.3rem',color:'#DC2626',margin:'0.5rem 0' }}>₹{r.price}</p>
            <p style={{ color:r.stock?'#059669':'#DC2626',fontSize:'0.85rem',fontWeight:'bold' }}>{r.stock?'🟢 In Stock':'🔴 Out of Stock'}</p>
            {r.stock && (
              <button onClick={()=>addToCart(r)} style={{ width:'100%',padding:'0.5rem',backgroundColor:'#DC2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',marginTop:'0.5rem' }}>
                + Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ position:'fixed',bottom:'0',left:'0',right:'0',backgroundColor:'white',padding:'1rem',boxShadow:'0 -4px 12px rgba(0,0,0,0.1)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <p style={{ fontWeight:'bold' }}>🛒 {cart.length} items</p>
            <p style={{ color:'#DC2626',fontWeight:'bold',fontSize:'1.2rem' }}>Total: ₹{total}</p>
          </div>
          <button onClick={()=>navigate('/homeopathy/checkout',{state:{cart,total}})} style={{ padding:'0.75rem 2rem',backgroundColor:'#DC2626',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'bold',fontSize:'1rem' }}>
            Checkout →
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeopathyPharmacy;