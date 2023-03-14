import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import axios from 'axios';

interface Article {
  title: string;
  summary: string;
  content: string;
}

function App() {

  const [inputURL, setInputURL] = useState(  '');
  const [article, setArticle] = useState<Article>({ 
    title: '',
    summary: '',
    content: ''
  });

  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if(inputURL == '') return;

    if(inputURL.match(/https:\/\/www.iltirreno.it\//g) == null) {
      alert("URL non valido"); // TODO: sostituire con modal
      return;
    }

    setLoading(true);
    

    axios.get(inputURL)
    .then(async (res) => {
      // Qui puoi utilizzare il contenuto della pagina
      const text = res.data; // il contenuto della pagina

      const scriptTag = text.match(/<script id="__NEXT_DATA__".*<\/script>/g); // troviamo il tag <script id="__NEXT_DATA__" ... </script>
      if (!scriptTag || scriptTag.length == 0) { alert("Articolo non trovato."); return;}
      const scriptContent = scriptTag[0]!.match(/<script id="__NEXT_DATA__".*>(.*)<\/script>/g)![0]!.replace(/<script id="__NEXT_DATA__".*>(.*)<\/script>/g, '$1'); // estraiamo il contenuto del tag (un JSON)
      if (!scriptContent) {alert("Articolo non trovato.");return;}

      // convertiamo il contenuto del tag in un oggetto Article
      let articleObj = null;
      try {
        articleObj = JSON.parse(scriptContent);
        articleObj = articleObj['props']['pageProps']['article'];
      } catch (e) {
        alert("Articolo non trovato nel JSON.");
        return;
      }

      
      if (!articleObj || !articleObj.title || !articleObj.summary || !articleObj.content){
        alert("Articolo non trovato");
        return;
      }

      setArticle(articleObj);
      await new Promise(r => setTimeout(r, 100)); // aspetta 100ms prima di nascondere il loader, per un effetto più fluido in caso di caricamento veloce
    
    }).finally(() => {
      setLoading(false);
    });


  };
  
  
  return (
    <div className="App">

      <h1 id="logotitle">Il Tirrwall</h1>
      <InputBar handleClick={handleClick} setInputURL={setInputURL} />
      <ArticleCard article={article} loading={loading} />
      
    </div>

    
  )
}



function InputBar({handleClick, setInputURL}: {handleClick: () => void, setInputURL: (value: string) => void}){ 


  return ( 
    <div>
        <input type="text" placeholder="Inserisci l'URL dell'articolo" onChange={(e) => setInputURL(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') handleClick()}} />
        <button onClick={ handleClick }>Leggi articolo</button>
    </div>
  );
}


function ArticleCard({article, loading}: {article: Article, loading: boolean} ){

  return (
    <>
    {loading && 
    <article> <div id="loaderdiv" aria-busy="true"></div></article>}

    {
      article && !loading && article.title && article.summary && article.content && article.title != '' && article.summary != '' && article.content != '' &&
      <article>
        {article.title && <h1>{article.title}</h1>}
        {article.summary && <blockquote>{article.summary}</blockquote>}
        {article.content && <div dangerouslySetInnerHTML={{ __html: article.content }}></div>}
      </article>
    }
    </>
  );

}

export default App
