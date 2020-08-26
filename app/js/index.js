window.app.receive('receive:profile', (profile) => {
	console.debug('In index.js, receive profile....')
	console.debug('Profile:')
	const prof = JSON.parse(profile)
	console.debug(prof)
	document.getElementById('picture').src = prof.picture
	document.getElementById('name').innerText = prof.name
	document.getElementById('success').innerText = 'You successfully used your GSuite to authenticate.'
})
