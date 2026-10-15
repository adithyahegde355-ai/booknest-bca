import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, UserRound, BookOpen, ChevronDown, Menu, X, Star, SlidersHorizontal, ArrowRight, ShieldCheck, Truck, Gift, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";

const API = `${(import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "")}/api`;
const languages = ["All languages","Kannada","Hindi","English","Tulu","Tamil","Telugu","Malayalam","Marathi","Bengali"];
const genres = ["All categories","Novels & stories","Textbooks","Programming & IT","Poetry","Comics & graphic novels","Competitive exam books"];
const money = n => n === 0 ? "Free" : new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

function BookCover({book}) {
  const [failed,setFailed] = useState(false);
  if(book.cover && !failed) return <img className="book-cover" src={book.cover} alt={`Cover of ${book.title}`} loading="lazy" onError={()=>setFailed(true)} />;
  return <div className={`cover-placeholder cover-${book.id%5}`}><span>BOOKNEST EDITION</span><strong>{book.title}</strong><small>{book.author}</small></div>;
}

export default function App() {
  const [books,setBooks] = useState([]);
  const [query,setQuery] = useState("");
  const [language,setLanguage] = useState("All languages");
  const [genre,setGenre] = useState("All categories");
  const [format,setFormat] = useState("All formats");
  const [sort,setSort] = useState("featured");
  const [cart,setCart] = useState([]);
  const [cartOpen,setCartOpen] = useState(false);
  const [loginOpen,setLoginOpen] = useState(false);
  const [email,setEmail] = useState("reader@booknest.demo");
  const [password,setPassword] = useState("booknest123");
  const [user,setUser] = useState(null);
  const [notice,setNotice] = useState("");
  const [coupon,setCoupon] = useState("");
  const [student,setStudent] = useState(false);
  const [checkoutOpen,setCheckoutOpen] = useState(false);
  const [payment,setPayment] = useState("COD");
  const [customerName,setCustomerName] = useState("");
  const [pin,setPin] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ fetch(`${API}/books`).then(r=>r.json()).then(d=>setBooks(d.books||[])).catch(()=>setNotice("Could not connect to the API. Start the server using the README instructions.")).finally(()=>setLoading(false)); },[]);
  const visible = useMemo(()=> {
    let out = books.filter(b => `${b.title} ${b.author}`.toLowerCase().includes(query.toLowerCase()));
    if(language!=="All languages") out=out.filter(b=>b.language===language);
    if(genre!=="All categories") out=out.filter(b=>b.genre===genre);
    if(format!=="All formats") out=out.filter(b=>b.format===format);
    if(sort==="price-low") out=[...out].sort((a,b)=>a.price-b.price);
    if(sort==="price-high") out=[...out].sort((a,b)=>b.price-a.price);
    if(sort==="popular") out=[...out].sort((a,b)=>b.rating-a.rating);
    if(sort==="bestsellers") out=out.filter(b=>b.bestseller);
    return out;
  },[books,query,language,genre,format,sort]);
  const cartCount = cart.reduce((n,item)=>n+item.quantity,0);
  const subtotal = cart.reduce((n,item)=>n+item.price*item.quantity,0);
  const couponDiscount = coupon.trim().toUpperCase()==="WELCOME10" ? subtotal*.1 : coupon.trim().toUpperCase()==="STUDENT15" ? subtotal*.15 : 0;
  const studentDiscount = student ? subtotal*.05 : 0;
  const total = Math.max(0,subtotal-couponDiscount-studentDiscount);

  function addBook(book) {
    setCart(old=>{const found=old.find(i=>i.id===book.id);return found?old.map(i=>i.id===book.id?{...i,quantity:i.quantity+1}:i):[...old,{...book,quantity:1}];});
    setNotice(`${book.title} added to your bag`);
    setTimeout(()=>setNotice(""),2400);
  }
  function changeQty(id,delta) { setCart(old=>old.map(i=>i.id===id?{...i,quantity:i.quantity+delta}:i).filter(i=>i.quantity>0)); }
  async function login(e) {
    e.preventDefault();
    try {
      const r=await fetch(`${API}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.message||"Login failed");
      setUser(d.user);setLoginOpen(false);setNotice(`Welcome, ${d.user.name}`);
    } catch(err) {setNotice(err.message);}
  }
  async function placeOrder(e) {
    e.preventDefault();
    if(!cart.length) return;
    if(!/^\d{6}$/.test(pin)) {setNotice("Enter a valid 6-digit Indian PIN code.");return;}
    try {
      const r=await fetch(`${API}/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart.map(i=>({id:i.id,quantity:i.quantity})),paymentMethod:payment,customer:{name:customerName,pin}})});
      const d=await r.json(); if(!r.ok) throw new Error(d.message||"Order failed");
      setCart([]);setCheckoutOpen(false);setCartOpen(false);setCoupon("");setStudent(false);
      setNotice(`Order ${d.order.id} placed. ${payment==="UPI_DEMO"?"UPI demo only — no money was collected.":"Cash on Delivery selected."}`);
    } catch(err) {setNotice(err.message);}
  }

  return <div className="app">
    <div className="topline">A good book opens a thousand doors <span>✦</span> Free demo delivery across India</div>
    <header className="header">
      <button className="icon-btn mobile-menu" aria-label="Open menu"><Menu size={21}/></button>
      <a className="brand" href="#" onClick={e=>{e.preventDefault();setLanguage("All languages");setGenre("All categories");setQuery("");}}>
        <span className="brand-mark"><BookOpen size={25}/></span><span><strong>BookNest</strong><small>INDIA'S BOOK MARKETPLACE</small></span>
      </a>
      <nav className="main-nav"><a href="#catalogue">Shop books</a><a href="#regional">Regional books</a><a href="#bestsellers" onClick={()=>setSort("bestsellers")}>Bestsellers</a><a href="#about">Our story</a></nav>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Account" onClick={()=>setLoginOpen(true)}><UserRound size={20}/><span className="action-label">{user?user.name.split(" ")[0]:"Account"}</span></button>
        <button className="bag-btn" onClick={()=>setCartOpen(true)}><ShoppingBag size={19}/><span>Bag</span><b>{cartCount}</b></button>
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span></span> STORIES THAT FEEL LIKE HOME</div>
          <h1>Every language<br/>has a <em>story.</em></h1>
          <p>From Kannada classics to new-age coding guides, find the books that speak to you.</p>
          <a className="primary-btn" href="#catalogue">Explore the collection <ArrowRight size={17}/></a>
          <div className="hero-proof"><div className="proof-avatars"><span>ಕ</span><span>अ</span><span>A</span></div><span>For every reader, in every language.</span></div>
        </div>
        <div className="hero-art" aria-label="Featured books">
          <div className="sun-disc"></div><div className="plant plant-one"></div>
          <div className="hero-book hero-book-back"><span>THE ART OF<br/>SLOW LIVING</span></div>
          <div className="hero-book hero-book-mid"><span>STORIES<br/>OF INDIA</span><small>AN ANTHOLOGY</small></div>
          <div className="hero-book hero-book-front"><span>THE<br/>BOOK<br/>OF DAYS</span><small>FIND YOUR NEXT CHAPTER</small></div>
          <div className="hero-stamp">READ<br/>LOCAL<br/><b>✦</b></div>
        </div>
      </section>

      <section className="benefits">
        <div><span className="benefit-icon"><Truck size={20}/></span><span><b>India-wide delivery</b><small>Demo checkout, no real charge</small></span></div>
        <div><span className="benefit-icon"><ShieldCheck size={20}/></span><span><b>Reader-first prices</b><small>Student savings & coupons</small></span></div>
        <div><span className="benefit-icon"><Gift size={20}/></span><span><b>Independent sellers</b><small>Discover local bookshops</small></span></div>
      </section>

      <section className="language-section" id="regional">
        <div className="section-heading"><div><div className="eyebrow">READ IN YOUR OWN WORDS</div><h2>Languages we <em>love.</em></h2></div><span className="muted">Nine languages. Countless worlds.</span></div>
        <div className="language-grid">{languages.slice(1).map((l,i)=><button key={l} className={`language-tile ${language===l?"selected":""}`} onClick={()=>{setLanguage(language===l?"All languages":l);document.querySelector("#catalogue")?.scrollIntoView({behavior:"smooth"});}}><span className="language-symbol">{["ಕ","अ","A","ತು","த","తె","മ","म","অ"][i]}</span><span>{l}</span><ArrowRight size={15}/></button>)}</div>
      </section>

      <section className="catalogue-section" id="catalogue">
        <div className="section-heading catalogue-title"><div><div className="eyebrow">THE BOOKNEST COLLECTION</div><h2>Find your next <em>favourite.</em></h2></div><span className="muted">{visible.length} books to explore</span></div>
        <div className="search-row"><div className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or author..." aria-label="Search books"/></div><div className="select-wrap"><SlidersHorizontal size={17}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort books"><option value="featured">Featured</option><option value="popular">Popular</option><option value="bestsellers">Bestsellers</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
        <div className="filters"><select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Filter language">{languages.map(l=><option key={l}>{l}</option>)}</select><select value={genre} onChange={e=>setGenre(e.target.value)} aria-label="Filter category">{genres.map(g=><option key={g}>{g}</option>)}</select><select value={format} onChange={e=>setFormat(e.target.value)} aria-label="Filter format">{["All formats","Paperback","Hardcover","Ebook"].map(f=><option key={f}>{f}</option>)}</select><button className="clear-btn" onClick={()=>{setQuery("");setLanguage("All languages");setGenre("All categories");setFormat("All formats");setSort("featured");}}>Clear filters</button></div>
        {loading?<div className="empty-state">Opening the shelves…</div>:visible.length===0?<div className="empty-state"><BookOpen size={30}/><h3>No books found</h3><p>Try another title, language or category.</p></div>:<div className="book-grid">{visible.map(book=><article className="book-card" key={book.id}><div className="cover-wrap"><BookCover book={book}/>{book.bestseller&&<span className="book-badge">BESTSELLER</span>}<button className="quick-add" aria-label={`Add ${book.title} to bag`} onClick={()=>addBook(book)}><Plus size={18}/></button></div><div className="book-meta"><span className="book-language">{book.language}</span><span className="rating"><Star size={12} fill="currentColor"/> {book.rating}</span></div><h3>{book.title}</h3><p className="author">{book.author}</p><div className="book-bottom"><div><strong>{money(book.price)}</strong><small>{book.format} · {book.seller}</small></div><button className="add-text" onClick={()=>addBook(book)}>Add <Plus size={14}/></button></div></article>)}</div>}
      </section>

      <section className="student-banner"><div className="student-icon"><Gift size={28}/></div><div><div className="eyebrow">A LITTLE SOMETHING FOR STUDENTS</div><h2>More learning. <em>Less spending.</em></h2><p>Activate the demo student discount at checkout and save 5% on your order.</p></div><button className="outline-btn" onClick={()=>{setStudent(true);setCartOpen(true);}}>Unlock student savings <ArrowRight size={16}/></button></section>
      <section className="seller-strip" id="about"><div><div className="eyebrow">MORE THAN A BOOKSHOP</div><h2>Small sellers. <em>Big stories.</em></h2><p>BookNest brings independent bookshops and curious readers together, from regional treasures to technical essentials.</p></div><div className="seller-stats"><div><strong>9</strong><span>Catalogue languages</span></div><div><strong>6</strong><span>Book categories</span></div><div><strong>24</strong><span>Sample listings</span></div></div></section>
    </main>

    <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><BookOpen size={22}/></span><span><strong>BookNest</strong><small>INDIA'S BOOK MARKETPLACE</small></span></a><p>Your language. Your stories. Your next chapter.</p><span>© 2026 BookNest · BCA project demo</span></footer>

    {notice&&<div className="toast" role="status"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

    {cartOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setCartOpen(false);}}><aside className="drawer"><div className="drawer-head"><div><div className="eyebrow">YOUR READING LIST</div><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-btn" onClick={()=>setCartOpen(false)} aria-label="Close bag"><X/></button></div>
      <div className="drawer-content">{cart.length===0?<div className="empty-state"><ShoppingBag size={34}/><h3>Your bag is waiting</h3><p>Add a book and let the next chapter begin.</p></div>:cart.map(item=><div className="cart-item" key={item.id}><div className="cart-cover"><BookCover book={item}/></div><div className="cart-info"><b>{item.title}</b><small>{item.author}</small><strong>{money(item.price)}</strong><div className="qty-control"><button onClick={()=>changeQty(item.id,-1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={()=>changeQty(item.id,1)} aria-label="Increase quantity"><Plus size={13}/></button><button className="remove-btn" onClick={()=>changeQty(item.id,-item.quantity)} aria-label="Remove book"><Trash2 size={14}/></button></div></div></div>)}</div>
      {cart.length>0&&<div className="drawer-footer"><label className="coupon-label">COUPON CODE</label><div className="coupon-row"><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="WELCOME10 or STUDENT15"/><button onClick={()=>setNotice(["WELCOME10","STUDENT15"].includes(coupon.trim().toUpperCase())?"Coupon applied!":"Enter WELCOME10 or STUDENT15")}>Apply</button></div><label className="student-check"><input type="checkbox" checked={student} onChange={e=>setStudent(e.target.checked)}/> Apply 5% student discount (demo)</label><div className="totals"><span>Subtotal</span><b>{money(subtotal)}</b>{couponDiscount>0&&<><span>Coupon savings</span><b className="saving">−{money(couponDiscount)}</b></>}{studentDiscount>0&&<><span>Student savings</span><b className="saving">−{money(studentDiscount)}</b></>}<span className="grand-total">Estimated total</span><strong className="grand-total">{money(total)}</strong></div><button className="primary-btn full-btn" onClick={()=>setCheckoutOpen(true)}>Continue to checkout <ArrowRight size={17}/></button><small className="demo-note">Demo only. No real payment is processed.</small></div>}</aside></div>}

    {loginOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setLoginOpen(false);}}><div className="modal"><button className="modal-close icon-btn" onClick={()=>setLoginOpen(false)} aria-label="Close login"><X/></button><div className="modal-icon"><BookOpen size={25}/></div><div className="eyebrow">WELCOME BACK</div><h2>Your next chapter awaits.</h2><p className="modal-desc">Sign in with one of the project demo accounts.</p><form onSubmit={login} className="form-stack"><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary-btn full-btn">Sign in <ArrowRight size={16}/></button></form><div className="demo-credentials"><b>Demo customer</b><span>reader@booknest.demo</span><b>Demo admin</b><span>admin@booknest.demo</span><small>Password for both: booknest123</small></div>{user&&<button className="clear-btn" onClick={()=>{setUser(null);setLoginOpen(false);}}>Sign out</button>}</div></div>}

    {checkoutOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setCheckoutOpen(false);}}><div className="modal checkout-modal"><button className="modal-close icon-btn" onClick={()=>setCheckoutOpen(false)} aria-label="Close checkout"><X/></button><div className="eyebrow">SECURE DEMO CHECKOUT</div><h2>Almost at your doorstep.</h2><p className="modal-desc">Delivery across India · Demo order only</p><form className="form-stack" onSubmit={placeOrder}><label>Full name<input value={customerName} onChange={e=>setCustomerName(e.target.value)} required placeholder="Your name"/></label><label>Indian PIN code<input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} required inputMode="numeric" placeholder="6-digit PIN code" pattern="[0-9]{6}"/></label><div className="payment-options"><label className={`payment-option ${payment==="COD"?"chosen":""}`}><input type="radio" name="payment" checked={payment==="COD"} onChange={()=>setPayment("COD")}/><span><b>Cash on Delivery</b><small>Pay when delivered (simulated)</small></span></label><label className={`payment-option ${payment==="UPI_DEMO"?"chosen":""}`}><input type="radio" name="payment" checked={payment==="UPI_DEMO"} onChange={()=>setPayment("UPI_DEMO")}/><span><b>UPI demo</b><small>No UPI PIN or real payment required</small></span></label></div><div className="checkout-total"><span>Order total</span><strong>{money(total)}</strong></div><button className="primary-btn full-btn">Place demo order <ArrowRight size={16}/></button></form><small className="demo-note">No payment is collected. Do not enter bank or UPI credentials.</small></div></div>}
  </div>;
}
