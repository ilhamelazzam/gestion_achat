/**
 * Récupère la valeur d'un cookie par son nom
 * @param {string} name - Le nom du cookie à récupérer
 * @returns {string} La valeur du cookie ou une chaîne vide si non trouvé
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return ''; // Pour le rendu côté serveur
  
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1] || '';
}
