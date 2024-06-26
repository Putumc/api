const express = require('express');
const cors = require('cors');
const path = require('path');
var request = require('request');
const fetch = require('node-fetch');
const axios = require('axios');
const { srgan2x, srgan4x } = require('super-resolution-scraper');
const cheerio = require("cheerio");
const app = express();
const { BingImageCreator } = require("./bingimg");
const apin = require("@siputzx/scraper") 
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());
// tiktok

const clean = (data) => {
  let regex = /(<([^>]+)>)/gi;
  data = data.replace(/(<br?\s?\/>)/gi, " \n");
  return data.replace(regex, "");
};

async function shortener(url) {
  return url;
}

async function tiktok(query)  {
  let response = await axios("https://lovetik.com/api/ajax/search", {
    method: "POST",
    data: new URLSearchParams(Object.entries({ query })),
  });

  result = {};

  result.creator = "YNTKTS";
  result.title = clean(response.data.desc);
  result.author = clean(response.data.author);
  result.nowm = await shortener(
    (response.data.links[0].a || "").replace("https", "http")
  );
  result.watermark = await shortener(
    (response.data.links[1].a || "").replace("https", "http")
  );
  result.audio = await shortener(
    (response.data.links[2].a || "").replace("https", "http")
  );
  result.thumbnail = await shortener(response.data.cover);
  return result;
}

// Fungsi untuk ragBot
async function ragBot(message) {
  try {
    const response = await axios.post('https://ragbot-starter.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }],
      useRag: true,
      llm: 'gpt-3.5-turbo',
      similarityMetric: 'cosine'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
// u
async function igdl(url) {
  let res = await axios("https://indown.io/");
  let _$ = cheerio.load(res.data);
  let referer = _$("input[name=referer]").val();
  let locale = _$("input[name=locale]").val();
  let _token = _$("input[name=_token]").val();
  let { data } = await axios.post(
    "https://indown.io/download",
    new URLSearchParams({
      link: url,
      referer,
      locale,
      _token,
    }),
    {
      headers: {
        cookie: res.headers["set-cookie"].join("; "),
      },
    },
  );
  let $ = cheerio.load(data);
  let result = [];
  let __$ = cheerio.load($("#result").html());
  __$("video").each(function () {
    let $$ = $(this);
    result.push({
      type: "video",
      thumbnail: $$.attr("poster"),
      url: $$.find("source").attr("src"),
    });
  });
  __$("img").each(function () {
    let $$ = $(this);
    result.push({
      type: "image",
      url: $$.attr("src"),
    });
  });

  return result;
}

// Fungsi untuk degreeGuru
async function degreeGuru(message, prompt) {
  try {
    const response = await axios.post('https://degreeguru.vercel.app/api/guru', {
      messages: [
        { role: 'user', content: message }
      ]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk pinecone
async function pinecone(message) {
  try {
    const response = await axios.post('https://pinecone-vercel-example.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk smartContract
async function smartContract(message) {
  try {
    const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
      messages: [{ content: message, role: "user" }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function blackboxAIChat(message) {
  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ id: null, content: message, role: 'user' }],
      id: null,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      isChromeExt: false,
      githubToken: null
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint untuk servis dokumen HTML
app.get('/Spotify-Clone', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk ragBot
app.get('/api/ragbot', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await ragBot(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk degreeGuru
app.get('/api/degreeguru', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await degreeGuru(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk pinecone
app.get('/api/pinecone', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await pinecone(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk smartContract
app.get('/api/smartcontract', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await smartContract(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk blackboxAIChat
app.get('/api/blackboxAIChat', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await blackboxAIChat(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/jadianime', async (req, res) => {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    var requestSettings = {
        url: `https://skizo.tech/api/toanime?apikey=nana&url=${url}`,
        method: 'GET',
        encoding: null
    };
    request(requestSettings, function (error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);
    });  
});
app.get('/api/remini', async (req, res) => {
 const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
  const img = await srgan2x(url) 
  const results = img.result
    var requestSettings = {
        url: results,
        method: 'GET',
        encoding: null
    };
    request(requestSettings, function (error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);
    });  
});
app.get('/api/remini2', async (req, res) => {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
const thih = await apin.remini(url) 
        res.set('Content-Type', 'image/jpg');
        res.send(thih); 
});
app.get('/api/igdownload', async (req, res) => {
	try{
    const text = req.query.url;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
igdl(text) 
	.then((result) => {	
    res.status(200).json({
      status: 200,
      creator: "Rian",
      result
    });
	}) 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/bingimg', async (req, res) => {
  try {
    const message = req.query.text;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const imgc = new BingImageCreator({
      cookie: `1Zxt18mWglT3GrbMxZDLIJ0nDZ0Pus0Y1lOvqOzhQpiQf3cjUxbtlTId7jaGJMxxwc7TkUFDlc2XOFd8DCd4rXhqQPKj1WZ8uVzl_dprRxDUJKVCnCsgvfjC4KRUDHhnQ8qx6Y0gt62HY2hHIF7QRBJsraay4_2Wj0olI2X4YMp51qgmBVVEQOL0aHugzoA8NnQwOmHlW7MzpzYgnWqTb5w`,
    });
    const data = await imgc.createImage(message);
            if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
          if (!data[i].endsWith(".svg")) {
		var result = data[i]
    res.status(200).json({
      status: 200,
      creator: "RIAN X EXONITY",
      result
    
    }); 
	  }
      }
      }
  } catch (error) {
    res.status(500).json({ error: error.message });
 }       

    });

app.get('/api/djviral', async (req, res) => {
  let response = await fetch('https://raw.githubusercontent.com/putumc/DJ-rian/main/database.json');
        var data = await response.json();
        var randomIndex = Math.floor(Math.random() * data.results.length);
        var randomResult = data.results[randomIndex];
        var downloadLink = randomResult.download;
    var requestSettings = {
        url: downloadLink,
        method: 'GET',
        encoding: null
    };
    request(requestSettings, function (error, response, body) {
        res.set('Content-Type', 'audio/mp3');
        res.send(body);
    });
});
app.get('/api/tiktok', async (req, res) => {
  const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
  tiktok(url)
    .then((result) => {
    res.json({
        status: true,
        code: 200,
        result
      })
    })  
    .catch(e => {
            console.log(e);
        })
});
app.get('/api/diffusionXL', async (req, res) => {
    const message = req.query.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "query" tidak ditemukan' });
    }
   var response = await fetch(`https://skizo.tech/api/sdxl?apikey=nana&prompt=${message}`);
    var data = await response.json();
    var { url: url } = data;
    var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };
    request(requestSettings, function (error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);
    });    

});
// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
