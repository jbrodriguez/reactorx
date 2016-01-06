import fetch from 'isomorphic-fetch'

export default class Api {
	constructor() {
		this.ep = 'https://www.reddit.com/r/'
	}

	fetchPosts(reddit) {
		const ep = this.ep + reddit + '.json'

		return fetch(ep)
			.then( resp => resp.json())
	}
}