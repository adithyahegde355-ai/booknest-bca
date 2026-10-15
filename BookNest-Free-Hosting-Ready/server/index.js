import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map(origin => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin not allowed by CORS"));
} }));
app.use(express.json());

const books = [
  {id:1,title:"Karvalo",author:"Poornachandra Tejaswi",language:"Kannada",genre:"Novels & stories",format:"Paperback",price:220,seller:"Sahitya House",rating:4.8,bestseller:true,isbn:"9780143443008"},
  {id:2,title:"Mookajjiya Kanasugalu",author:"K. Shivaram Karanth",language:"Kannada",genre:"Novels & stories",format:"Paperback",price:280,seller:"Kannada Pustaka",rating:4.9,bestseller:true,isbn:"9788170264017"},
  {id:3,title:"Malegalalli Madumagalu",author:"Kuvempu",language:"Kannada",genre:"Novels & stories",format:"Hardcover",price:650,seller:"Sahitya House",rating:4.9,bestseller:true,isbn:"9788170260026"},
  {id:4,title:"Ponniyin Selvan: The First Floods",author:"Kalki Krishnamurthy",language:"Tamil",genre:"Novels & stories",format:"Paperback",price:399,seller:"South Pages",rating:4.7,bestseller:true,isbn:"9789354401307"},
  {id:5,title:"The Guide",author:"R. K. Narayan",language:"English",genre:"Novels & stories",format:"Paperback",price:249,seller:"Readers' Corner",rating:4.6,bestseller:true,isbn:"9780143039648"},
  {id:6,title:"The God of Small Things",author:"Arundhati Roy",language:"English",genre:"Novels & stories",format:"Paperback",price:349,seller:"Readers' Corner",rating:4.6,bestseller:false,isbn:"9780006550686"},
  {id:7,title:"Godaan",author:"Munshi Premchand",language:"Hindi",genre:"Novels & stories",format:"Paperback",price:199,seller:"Hindi Granth",rating:4.7,bestseller:true,isbn:"9788170287451"},
  {id:8,title:"Madhushala",author:"Harivansh Rai Bachchan",language:"Hindi",genre:"Poetry",format:"Paperback",price:180,seller:"Hindi Granth",rating:4.8,bestseller:true,isbn:"9788121610296"},
  {id:9,title:"Wings of Fire",author:"A. P. J. Abdul Kalam",language:"English",genre:"Textbooks",format:"Paperback",price:299,seller:"Readers' Corner",rating:4.8,bestseller:true,isbn:"9788173711466"},
  {id:10,title:"The Alchemist",author:"Paulo Coelho",language:"English",genre:"Novels & stories",format:"Paperback",price:299,seller:"Readers' Corner",rating:4.7,bestseller:true,isbn:"9780062315007"},
  {id:11,title:"Clean Code",author:"Robert C. Martin",language:"English",genre:"Programming & IT",format:"Paperback",price:799,seller:"TechShelf",rating:4.7,bestseller:false,isbn:"9780132350884"},
  {id:12,title:"Eloquent JavaScript",author:"Marijn Haverbeke",language:"English",genre:"Programming & IT",format:"Ebook",price:0,seller:"TechShelf",rating:4.5,bestseller:false,isbn:"9781593279509"},
  {id:13,title:"Introduction to Algorithms",author:"Thomas H. Cormen et al.",language:"English",genre:"Textbooks",format:"Hardcover",price:1099,seller:"TechShelf",rating:4.8,bestseller:false,isbn:"9780262046305"},
  {id:14,title:"The Blue Umbrella",author:"Ruskin Bond",language:"English",genre:"Novels & stories",format:"Paperback",price:160,seller:"Readers' Corner",rating:4.5,bestseller:false,isbn:"9788171673407"},
  {id:15,title:"Aadujeevitham (Goat Days)",author:"Benyamin",language:"Malayalam",genre:"Novels & stories",format:"Paperback",price:320,seller:"South Pages",rating:4.7,bestseller:false,isbn:"9789384582042"},
  {id:16,title:"Amar Chitra Katha: Krishna",author:"Anant Pai",language:"English",genre:"Comics & graphic novels",format:"Paperback",price:120,seller:"StoryPanels",rating:4.5,bestseller:false,isbn:"9788184820190"},
  {id:17,title:"The Discovery of India",author:"Jawaharlal Nehru",language:"English",genre:"Textbooks",format:"Paperback",price:499,seller:"Readers' Corner",rating:4.4,bestseller:false,isbn:"9780143031031"},
  {id:18,title:"Competitive General Knowledge",author:"Manohar Pandey",language:"Hindi",genre:"Competitive exam books",format:"Paperback",price:250,seller:"ExamReady",rating:4.4,bestseller:false,isbn:"9789354883815"},
  {id:19,title:"Thirukkural",author:"Thiruvalluvar",language:"Tamil",genre:"Poetry",format:"Paperback",price:175,seller:"South Pages",rating:4.8,bestseller:false,isbn:"9780140445958"},
  {id:20,title:"Vachana Sahitya: Selected Vachanas",author:"Basavanna and other Vachana poets",language:"Kannada",genre:"Poetry",format:"Paperback",price:190,seller:"Kannada Pustaka",rating:4.6,bestseller:false,isbn:"9788129112342"},
  {id:21,title:"Tulu Paddana: Oral Traditions",author:"Selected traditional works",language:"Tulu",genre:"Poetry",format:"Paperback",price:240,seller:"Coastal Books",rating:4.3,bestseller:false,isbn:""},
  {id:22,title:"Telugu Short Stories",author:"Various authors",language:"Telugu",genre:"Novels & stories",format:"Paperback",price:210,seller:"South Pages",rating:4.2,bestseller:false,isbn:""},
  {id:23,title:"Marathi Stories for Readers",author:"Various authors",language:"Marathi",genre:"Novels & stories",format:"Paperback",price:200,seller:"Regional Reads",rating:4.2,bestseller:false,isbn:""},
  {id:24,title:"Selected Bengali Poems",author:"Rabindranath Tagore and others",language:"Bengali",genre:"Poetry",format:"Paperback",price:230,seller:"Regional Reads",rating:4.5,bestseller:false,isbn:""}
].map(b => ({...b, cover: b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg` : null}));

let orders = [];
const demoUsers = [
  {email:"reader@booknest.demo",password:"booknest123",role:"customer",name:"Demo Reader"},
  {email:"admin@booknest.demo",password:"booknest123",role:"admin",name:"BookNest Admin"}
];

app.get("/api/health", (_req,res) => res.json({ok:true,service:"BookNest API"}));
app.get("/api/books", (req,res) => {
  let result = [...books];
  const {q,language,genre,format,minPrice,maxPrice,sort} = req.query;
  if(q) result = result.filter(b => `${b.title} ${b.author} ${b.seller}`.toLowerCase().includes(String(q).toLowerCase()));
  if(language && language !== "All languages") result = result.filter(b => b.language === language);
  if(genre && genre !== "All categories") result = result.filter(b => b.genre === genre);
  if(format && format !== "All formats") result = result.filter(b => b.format === format);
  if(minPrice !== undefined && minPrice !== "") result = result.filter(b => b.price >= Number(minPrice));
  if(maxPrice !== undefined && maxPrice !== "") result = result.filter(b => b.price <= Number(maxPrice));
  if(sort === "price-low") result.sort((a,b)=>a.price-b.price);
  else if(sort === "price-high") result.sort((a,b)=>b.price-a.price);
  else if(sort === "popular") result.sort((a,b)=>b.rating-a.rating);
  else if(sort === "bestsellers") result = result.filter(b=>b.bestseller);
  res.json({books:result,total:result.length});
});
app.post("/api/login", (req,res) => {
  const {email,password} = req.body || {};
  const user = demoUsers.find(u=>u.email===email && u.password===password);
  if(!user) return res.status(401).json({message:"Invalid demo credentials"});
  res.json({user:{email:user.email,role:user.role,name:user.name},demo:true});
});
app.post("/api/orders", (req,res) => {
  const {items,paymentMethod,customer} = req.body || {};
  if(!Array.isArray(items) || items.length===0) return res.status(400).json({message:"Your cart is empty."});
  if(!["COD","UPI_DEMO"].includes(paymentMethod)) return res.status(400).json({message:"Choose a supported demo payment method."});
  const total = items.reduce((sum,item)=>{
    const book = books.find(b=>b.id===Number(item.id));
    return sum + (book ? book.price * Math.max(1,Number(item.quantity)||1) : 0);
  },0);
  const order = {id:`BN${Date.now().toString().slice(-8)}`,items,paymentMethod,total,status:paymentMethod==="COD"?"Order placed — demo":"UPI simulated — no money collected",customer:customer||{},createdAt:new Date().toISOString()};
  orders.push(order);
  res.status(201).json({order});
});
app.get("/api/orders", (_req,res)=>res.json({orders}));
app.listen(PORT,()=>console.log(`BookNest API running at http://localhost:${PORT}`));
