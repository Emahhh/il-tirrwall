import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import '@picocss/pico/css/pico.min.css';

function App() {
  const [inputURL, setInputURL] = useState('');
  const [article, setArticle] = useState({});

  const handleClick = () => {
    if(inputURL == '') return;
    
    // standardizzare l'URL

    if(inputURL.match(/https:\/\/www.iltirreno.it\//g) == null) {
      alert("URL non valido");
      // TODO: sostituire con modal
      return;
    }

    fetch(inputURL)
    .then(response => response.text())
    .then(text => {
      // Qui puoi utilizzare il contenuto della pagina

      const scriptTag = text.match(/<script id="__NEXT_DATA__".*<\/script>/g); // troviamo il tag <script id="__NEXT_DATA__" ... </script>
      if (!scriptTag || scriptTag.length == 0) { alert("Articolo non trovato."); return;}
      const scriptContent = scriptTag[0].match(/(?<=>).*(?=<\/script>)/g)[0]; // estraiamo il contenuto del tag
      if (!scriptContent) {alert("Articolo non trovato.");return;}

      // convertiamo il contenuto del tag in un oggetto
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
    });


    

  };

  return (
    <div className="App">

      <h1 id="logotitle">Il Paywallreno</h1>

      <div>
        <input type="text" placeholder="Inserisci URL articolo www.iltirreno.it/..." onChange={(e) => setInputURL(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') handleClick()}} />
        <button onClick={ handleClick }>Leggi articolo</button>
      </div>

      {article['title'] && 
        <article>
          {article['title'] && <h1>{article['title']}</h1>}
          {article['summary'] && <p>{article['summary']}</p>}
          {article['content'] && <div dangerouslySetInnerHTML={{__html: article['content']}}></div>}
        </article>
      }
      
    </div>

    
  )
}

export default App
