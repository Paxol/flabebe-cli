#!/usr/bin/env node

import fetch from "node-fetch";
import prompts from "prompts";

import { config } from "dotenv";
config();

const API_KEY = process.env.API_KEY;
const API_HOST = process.env.API_HOST;
const API_CREATE_LINK = process.env.API_CREATE_LINK;
const API_LATEST_LINKS = process.env.API_LATEST_LINKS;

async function getLatest(n) {
	const bodyContent = JSON.stringify({
		json: {
			api_key: API_KEY, n
		}
	});

	var requestOptions = {
		method: 'GET',
		redirect: 'follow'
	};

	const data = await fetch(`${API_HOST}/${API_LATEST_LINKS}?input=${bodyContent}`, requestOptions)
		.then(response => response.json());

	if (data.error) {
		// Errore
		console.log(`Si è verificato un errore: ${data.error.json?.message}`);
		return;
	}

	data.result.data.json.forEach(link => {
		console.log(`${API_HOST}/${link.slug}\t==>\t${link.url}`)
	});
}

const createShortLink = async (url) => {	
	let bodyContent = JSON.stringify({
		json: {
			api_key: API_KEY,
			url
		}
	});

	const res = await fetch(`${API_HOST}/${API_CREATE_LINK}`, {
		method: "POST",
		body: bodyContent,
		headers: {
			"content-type": "application/json"
		}
	});

	const data = await res.json();

	if (data.error) {
		const message = data.error?.json?.message;

		if (message) {
			console.log(`An error occurred: ${message}`);
			return;
		} else {
			console.log("An error occurred, try again later");
			return;
		}
	}

	const slug = data.result.data.json.slug;
	console.log(`${API_HOST}/${slug}\t==>\t${url}`)
}

(async () => {
	const response = await prompts({
		type: "select",
		name: "value",
		message: "Cosa fare?",
		choices: ["Ultimi link", "Nuovo link"],
	})

	switch (response.value) {
		case 0: // Ultimi link
			const numResponse = await prompts({
				type: "number",
				name: "value",
				message: "Quanti link prendere?",
			})

			await getLatest(numResponse.value)
			break;
		case 1: // Nuovo link
			const urlResponse = await prompts({
				type: "text",
				name: "value",
				message: "Inserire l'URL: ",
			})

			await createShortLink(urlResponse.value)
			break;

		default:
			console.log("Errore nella scelta")
			break;
	}
})()