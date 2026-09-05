// Netlify's default invitation and password-recovery links return to the site
// root. Email templates are not editable on every plan, so forward Identity
// callbacks straight to the CMS, where the Identity widget is already loaded.
const identityCallback = /#(?:invite_token|recovery_token|confirmation_token|access_token)=/.test(window.location.hash)

if (identityCallback) {
  window.location.replace(`/admin/${window.location.hash}`)
} else if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', (user) => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        window.location.href = '/admin/'
      })
    }
  })
}
