window.setTimeout(() => {
  window._gaq = window._gaq || [];
  window._gaq.push(['_setAccount', 'UA-61022745-12']);
  window._gaq.push(['_trackPageview']);
  
  const ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  const script = document.getElementsByTagName('script')[0];
  script.parentNode.insertBefore(ga, script);
}, 1000);
