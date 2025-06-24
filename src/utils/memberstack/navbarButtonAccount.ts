MemberStack.onReady.then(function (member) {
  if (member.loggedIn) {
    // Vérifiez si le membre a le plan "premium-ressources"
    if (member.plans && member.plans.includes('premium-ressources')) {
      // Rendre le bouton visible
      document.getElementById('votre-bouton').style.display = 'block';
    } else {
      // Cacher le bouton
      document.getElementById('votre-bouton').style.display = 'none';
    }
  } else {
    // Si pas connecté, cacher le bouton
    document.getElementById('votre-bouton').style.display = 'none';
  }
});
