# Aesthetic Birthday Surprise Website

Yeh ek complete responsive romantic love-theme birthday website hai. Isme heart animations, intro surprise, music, confetti, couple photo gallery, love-story timeline, personal love letter aur candle-blow animation hai.

## Website kaise chalayein

### NPM method

Website folder ke andar terminal kholkar run karein:

```bash
npm install
npm start
```

Uske baad browser mein `http://localhost:3000` open karein.

### Bina NPM ke

Sabse aasaan tareeka:

1. ZIP extract karein.
2. `index.html` par double-click karein.
3. Best experience ke liye VS Code mein folder kholkar **Live Server** extension se `index.html` run karein.

## Naam aur message kaise badlein

`config.js` file VS Code mein kholein. Upar diye gaye values edit karein:

- `personName`: birthday person ka naam
- `senderName`: aapka naam
- `heroMessage`: main birthday wish
- `letterParagraphs`: personal letter ke paragraphs
- `timeline`: aapki memories/story
- `reasons`: us person ki special qualities

## Apni photos permanently kaise add karein

1. Apni photos `assets/photos/` folder mein paste karein.
2. Simple file names rakhein, jaise `photo-1.jpg`, `photo-2.jpg`.
3. `config.js` mein `photos` list ke paths replace karein:

```js
photos: [
  { src: "assets/photos/photo-1.jpg", caption: "Our best day" },
  { src: "assets/photos/photo-2.jpg", caption: "That perfect smile" },
  { src: "assets/photos/photo-3.jpg", caption: "Forever favorite" }
]
```

Jitni photos chaahein utne objects add kar sakte hain. Pehli 4 photos hero aur letter section mein bhi automatically use hongi.

## Website ke andar se photos upload karna

Gallery ke neeche **Choose photos** button se ek saath bahut saari photos select kar sakte hain. Yeh photos current browser mein save rahengi. Kisi aur person/device ko website bhejne ke liye permanent method (`assets/photos/` + `config.js`) use karein.

## Music

Website copyright-free synthesized birthday tune bajati hai, isliye kisi MP3 file ki zarurat nahi. Top-right music button se on/off kar sakte hain.

## Hosting

Is folder ko Netlify Drop, Vercel, GitHub Pages ya kisi normal hosting par upload kiya ja sakta hai. Koi build command ya dependency required nahi hai.
