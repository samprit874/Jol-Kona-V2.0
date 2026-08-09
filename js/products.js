/* ═══════════════════════════════════════════════════════════════
   জলকণা — Product Database
   ═══════════════════════════════════════════════════════════════
   
   HOW TO ADD A NEW PRODUCT:
   
   1. Upload your image to https://imgbb.com (free, no signup needed for quick upload)
      OR save image in img/products/ folder
   
   2. Copy the direct image URL from ImgBB
      Example: https://i.ibb.co/xxxxx/my-product.jpg
   
   3. Add a new entry below (copy the format):
   
   {
     name: "Your Product Name",
     category: "gift-hampers",        ← choose: gift-hampers, custom-chocolates, clay-jewellery, pipe-cleaner, keychains, crochet
     image: "https://i.ibb.co/xxxxx/my-product.jpg",   ← paste ImgBB URL here
     badge: "New",                    ← or "Bestseller", "Popular", "Handmade", or "" for none
     description: "Short description of the product...",
     dmText: "Hi! I'd like to order [Product Name] 🎁"
   },
   
   4. Save this file. Refresh the page. Done! ✅
   
   CATEGORIES:
   - gift-hampers       → Gift hamper bouquets
   - custom-chocolates  → Custom chocolate wrappers
   - clay-jewellery     → Clay jewellery & hair accessories
   - pipe-cleaner       → Pipe cleaner flowers & crafts
   - keychains          → Keychains
   - crochet            → Crochet accessories & hair clips
   
   ═══════════════════════════════════════════════════════════════ */

const PRODUCTS = [

  // ═══════ GIFT HAMPERS ═══════
  {
    name: "Photo & Chocolate Memory Bouquet",
    category: "gift-hampers",
    image: "img/products/gift-hamper-bouquet-1.webp",
    badge: "Bestseller",
    description: "A personalized bouquet with photos, chocolates, butterflies & a beautiful bow — a gift they can smile at, eat, and keep forever.",
    dmText: "Hi! I'm interested in the Photo & Chocolate Memory Bouquet 💐"
  },
  {
    name: "Bundle of Smiles Hamper",
    category: "gift-hampers",
    image: "img/products/gift-hamper-bouquet-2.webp",
    badge: "Popular",
    description: "Not just a gift — a bundle of smiles! KitKat, nail polish, scrunchie, photos & butterflies wrapped in a stunning black bouquet.",
    dmText: "Hi! I'm interested in the Bundle of Smiles Hamper 🎁"
  },
  {
    name: "Personalized Photo & Treats Hamper",
    category: "gift-hampers",
    image: "img/products/photo-gift-hamper-2.jpg",
    badge: "New",
    description: "A beautiful bouquet of memories — photos, KitKat, scrunchie, pipe cleaner flowers & a handwritten love note wrapped in elegant black paper.",
    dmText: "Hi! I'm interested in the Personalized Photo & Treats Hamper 🎁"
  },

  // ══════ CUSTOM CHOCOLATES ══════
  {
    name: "Handpainted Chocolate Wrapper",
    category: "custom-chocolates",
    image: "img/products/custom-chocolate-wrapper.webp",
    badge: "Handpainted",
    description: "Beautifully hand-painted chocolate wrapper with Bengali folk art — a sweet gift wrapped in tradition and love.",
    dmText: "Hi! I'd like to order a Handpainted Chocolate Wrapper 🍫"
  },

  // ═══════ CLAY JEWELLERY ═══════
  {
    name: "Bengali Name Necklace",
    category: "clay-jewellery",
    image: "img/products/clay-name-necklace.webp",
    badge: "Personalized",
    description: "Handcrafted clay pendant with your name in beautiful Bengali calligraphy — a wearable piece of art, made just for you.",
    dmText: "Hi! I'd like to order a Bengali Name Necklace 💍"
  },
  {
    name: "Clay Flower Hair Pin",
    category: "clay-jewellery",
    image: "img/products/clay-hair-pin.webp",
    badge: "চুলের গহনা",
    description: "Traditional Bengali hair pin with hand-sculpted flower, cowrie shells & colorful beads — elegance for your everyday look.",
    dmText: "Hi! I'd like to order a Clay Flower Hair Pin 💗"
  },
  {
    name: "Braided Tassel Hair Accessory",
    category: "clay-jewellery",
    image: "img/products/braided-hair-accessory.jpg",
    badge: "চুলের গহনা",
    description: "Colorful hand-braided hair tie with cowrie shells, pearl beads & vibrant tassels — a touch of boho elegance for every occasion.",
    dmText: "Hi! I'd like to order a Braided Tassel Hair Accessory 💗"
  },

  // ═══════ PIPE CLEANER ═══════
  {
    name: "Pink Flower Bouquet",
    category: "pipe-cleaner",
    image: "img/products/pipe-cleaner-bouquet.webp",
    badge: "For You 🩷",
    description: "A never-wilting bouquet made entirely from pipe cleaners — soft, fluffy, and forever. Wrapped in black paper with a ribbon tag.",
    dmText: "Hi! I'd like to order a Pink Pipe Cleaner Flower Bouquet 🌸"
  },
  {
    name: "Handmade Pipe Cleaner Collection",
    category: "pipe-cleaner",
    image: "img/products/pipe-cleaner-collection.webp",
    badge: "Collection",
    description: "Flowers, keychains, bouquets, teddy bears — little things made with love. Choose your favorite or let us design something unique.",
    dmText: "Hi! I'm interested in the Pipe Cleaner Collection 🌸"
  },
  {
    name: "Red Velvet Pipe Cleaner Bouquet",
    category: "pipe-cleaner",
    image: "img/products/pipe-cleaner-red-bouquet.jpg",
    badge: "Handmade",
    description: "Stunning red & pink pipe cleaner flowers with curly green stems — a forever bouquet wrapped in elegant black paper with a satin ribbon.",
    dmText: "Hi! I'd like to order a Red Velvet Pipe Cleaner Bouquet 🌸"
  },

  // ═══════ KEYCHAINS ═══════
  {
    name: "Couple Heart Keychain",
    category: "keychains",
    image: "img/products/spiderman-couple-keychain.webp",
    badge: "Couple Gift",
    description: "Two halves of one heart — hand-painted couple keychain. A little keychain with a lot of love, perfect for you and your person.",
    dmText: "Hi! I'd like to order a Couple Heart Keychain ❤️"
  },
  {
    name: "Hello Kitty Keychain",
    category: "keychains",
    image: "img/products/hello-kitty-keychain.webp",
    badge: "Cute 🎀",
    description: "Adorable handcrafted Hello Kitty pipe cleaner keychain — fluffy, cute, and perfect for your bag or keys.",
    dmText: "Hi! I'd like to order a Hello Kitty Keychain 🎀"
  },

  // ═══════ PHONE CHARMS ═══════
  {
    name: "Handmade Pipe Cleaner Phone Charm",
    category: "keychains",
    image: "https://i.ibb.co/nsT5mGLc/Handmade-cleaner-phone-charm-love-gifts-india-handmade-Jolkona-1.webp",
    badge: "New",
    description: "A fluffy, handcrafted pipe cleaner phone charm to dress up your phone — cute, lightweight and made with love. Also perfect for bags, keys & pencil cases.",
    dmText: "Hi! I'd like to order the Handmade Pipe Cleaner Phone Charm 📱"
  },
  {
    name: "Cute Handmade Phone Charm",
    category: "keychains",
    image: "https://i.ibb.co/DPvnVXp5/Handmade-cleaner-phone-charm-love-gifts-india-handmade-Jolkona.webp",
    badge: "New",
    description: "An adorable handmade phone charm crafted from soft pipe cleaners — a tiny dangle of joy for your phone. A sweet gift for friends, sisters & everyone who loves cute things.",
    dmText: "Hi! I'd like to order the Cute Handmade Phone Charm 📱"
  },
  {
    name: "Adorable Pipe Cleaner Phone Charm",
    category: "keychains",
    image: "https://i.ibb.co/wFWJ98Fj/Handmade-cleaner-phone-charm-love-gifts-india-handmade-Jolkona-2.webp",
    badge: "New",
    description: "Another adorable handmade pipe cleaner phone charm from the Jol Kona charm collection — soft, fluffy and full of personality. Perfect for phones, bags, keys & pencil cases, and a sweet little gift for someone you love.",
    dmText: "Hi! I'd like to order the Adorable Pipe Cleaner Phone Charm 📱"
  },

  // ═══════ CROCHET ═══════
  {
    name: "Crochet Bow Hair Clip",
    category: "crochet",
    image: "https://i.ibb.co/35gh5tKC/Crochet-accessory-crochet-love-follow-handmade-cute.webp",
    badge: "New",
    description: "A cute handmade crochet bow hair clip — soft, fluffy and full of charm. A sweet accessory for your hair, and a lovely handmade gift for someone you love.",
    dmText: "Hi! I'd like to order the Crochet Bow Hair Clip 🎀"
  },
  {
    name: "Crochet Flower Hair Clip",
    category: "crochet",
    image: "https://i.ibb.co/DH7bBv6G/Crochet-accessory-crochet-love-follow-handmade-cute-2.webp",
    badge: "New",
    description: "A beautiful handmade crochet flower hair clip — soft, fluffy petals full of charm. A sweet accessory for your hair, and a lovely handmade gift for someone you love.",
    dmText: "Hi! I'd like to order the Crochet Flower Hair Clip 🌸"
  },
  {
    name: "Crochet Cherry Hair Clip",
    category: "crochet",
    image: "https://i.ibb.co/gbnXMJ51/Crochet-accessory-crochet-love-follow-handmade-cute-4.webp",
    badge: "New",
    description: "An adorable handmade crochet cherry hair clip — cute little cherries full of charm. A sweet accessory for your hair, and a lovely handmade gift for someone you love.",
    dmText: "Hi! I'd like to order the Crochet Cherry Hair Clip 🍒"
  },

  // ═══════════════════════════════════════════
  // ADD NEW PRODUCTS BELOW THIS LINE
  // Copy the format above and paste here
  // ═══════════════════════════════════════════

];

// Expose to shop.js (js/shop.js reads window.PRODUCTS — a top-level `const`
// does not create a window property, so assign it explicitly).
window.PRODUCTS = PRODUCTS;
