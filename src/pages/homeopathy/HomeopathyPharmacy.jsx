import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaSearch, FaArrowLeft, FaStar, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';

const HomeopathyPharmacy = () => {
  const navigate = useNavigate();
  const [remedies, setRemedies] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'First Aid', 'Digestive', 'Joint Pain', 'Women Health', 'Respiratory', 'Allergy', 'Skin Care', 'Emotional'];

  useEffect(() => {
    fetchRemedies();
  }, []);

  const fetchRemedies = async () => {
    try {
      const res = await api.get('/homeopathy/pharmacy');
      if (res.data?.success && res.data?.data?.length > 0) {
        setRemedies(res.data.data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (remedy) => setCart([...cart, remedy]);
  const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const filtered = remedies.filter(r => {
    const matchSearch = !search || (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.category||'').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ minHeight:'100vh',backgroundColor:'#f8fafc',fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#dc2626,#991b1b)',padding:'20px',color:'white' }}>
        <div style={{ maxWidth:'1100px',margin:'0 auto',display:'flex',alignItems:'center',gap:'12px' }}>
          <button onClick={()=>navigate('/homeopathy')} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'white',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',fontSize:'14px' }}>← Back</button>
          <h1 style={{ fontSize:'20px',fontWeight:'800',margin:0 }}>💊 Homeopathy Pharmacy</h1>
        </div>
      </div>

      <div style={{ maxWidth:'1100px',margin:'0 auto',padding:'16px' }}>
        {/* Search + Cart */}
        <div style={{ display:'flex',gap:'10px',marginBottom:'14px',flexWrap:'wrap' }}>
          <div style={{ flex:1,minWidth:'250px',display:'flex',alignItems:'center',background:'white',borderRadius:'10px',padding:'0 14px',border:'1px solid #e2e8f0' }}>
            <FaSearch style={{ color:'#94a3b8',fontSize:'14px' }} />
            <input placeholder="Search remedies by name or category..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:'100%',padding:'12px 10px',border:'none',outline:'none',fontSize:'14px' }} />
          </div>
          {cart.length > 0 && (
            <button onClick={()=>navigate('/homeopathy/checkout',{state:{cart,total}})}
              style={{ display:'flex',alignItems:'center',gap:'6px',padding:'12px 20px',background:'#dc2626',color:'white',border:'none',borderRadius:'10px',fontWeight:'700',cursor:'pointer',fontSize:'13px',whiteSpace:'nowrap' }}>
              <FaShoppingCart /> {cart.length} • ₹{total}
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div style={{ display:'flex',gap:'6px',marginBottom:'14px',overflowX:'auto',paddingBottom:'4px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={()=>setActiveCategory(cat)}
              style={{ padding:'7px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',
                background:activeCategory===cat?'#dc2626':'white',color:activeCategory===cat?'white':'#475569',border:activeCategory===cat?'none':'1px solid #e2e8f0' }}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Remedies Grid */}
        {loading ? (
          <div style={{ textAlign:'center',padding:'40px',color:'#64748b' }}>Loading remedies...</div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:'10px' }}>
            {filtered.map((r,i) => (
              <motion.div key={r._id||i} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.03 }}
                style={{ background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',border:`1.5px solid ${r.stock!==false?'#059669':'#dc2626'}20`,textAlign:'center',position:'relative' }}>
                {!r.stock&&r.stock!==undefined&&<span style={{ position:'absolute',top:'8px',right:'8px',background:'#fef2f2',color:'#dc2626',padding:'2px 8px',borderRadius:'8px',fontSize:'10px',fontWeight:'700' }}>OOS</span>}
                <div style={{ fontSize:'32px',marginBottom:'6px' }}>💊</div>
                <h3 style={{ fontSize:'12px',fontWeight:'700',color:'#1e293b',marginBottom:'4px' }}>{r.name}</h3>
                <p style={{ fontSize:'10px',color:'#64748b',marginBottom:'4px' }}>{r.potency||'30C'} • {r.category}</p>
                <p style={{ fontSize:'16px',fontWeight:'800',color:'#dc2626',margin:'4px 0' }}>₹{r.price||0}</p>
                <button onClick={()=>addToCart(r)}
                  style={{ width:'100%',padding:'8px',background:(r.stock===false)?'#e2e8f0':'#dc2626',color:(r.stock===false)?'#94a3b8':'white',border:'none',borderRadius:'6px',fontWeight:'600',fontSize:'11px',cursor:(r.stock===false)?'not-allowed':'pointer' }}
                  disabled={r.stock===false}>
                  + Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trust */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'10px',marginTop:'20px' }}>
          {[
            { icon:<FaCheckCircle size={18}/>, title:'Genuine Remedies',desc:'Sourced from GMP-certified pharmacies' },
            { icon:<FaStar size={18}/>, title:'Quality Assured',desc:'All remedies potency-verified' },
            { icon:<FaShoppingCart size={18}/>, title:'Fast Delivery',desc:'OTP-verified doorstep delivery' },
          ].map((f,i)=>(
            <div key={i} style={{ textAlign:'center',padding:'14px 10px',background:'white',borderRadius:'10px',border:'1px solid #f1f5f9' }}>
              <div style={{ color:'#dc2626',marginBottom:'4px' }}>{f.icon}</div>
              <h3 style={{ fontSize:'12px',fontWeight:'700',color:'#1e293b',margin:'0 0 2px' }}>{f.title}</h3>
              <p style={{ fontSize:'10px',color:'#64748b',margin:0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'white',padding:'12px 20px',boxShadow:'0 -4px 20px rgba(0,0,0,0.1)',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:100 }}>
          <div>
            <p style={{ fontWeight:'700',fontSize:'13px',margin:0 }}>🛒 {cart.length} item{cart.length>1?'s':''}</p>
            <p style={{ color:'#dc2626',fontWeight:'800',fontSize:'16px',margin:'2px 0 0' }}>₹{total}</p>
          </div>
          <button onClick={()=>navigate('/homeopathy/checkout',{state:{cart,total}})}
            style={{ padding:'12px 28px',background:'#dc2626',color:'white',border:'none',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'14px' }}>
            Checkout →
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeopathyPharmacy;

