import { http, HttpResponse } from "msw";

export const gravatar = {
	success: http.get("https://api.gravatar.com/v3/profiles/:hash", () => {
		return HttpResponse.json({
			hash: "14330318de450e39207d3063ca9dc23698bba910562fdb497d50cc52e1bae0ea",
			display_name: "Sergio Xalambrí",
			location: "Perú",
			job_title: "Web Developer",
			company: "Daffy.org",
			pronouns: "He/Him",
		});
	}),

	notFoundError: http.get("https://api.gravatar.com/v3/profiles/:hash", () => {
		return new HttpResponse(null, { status: 404 });
	}),

	rateLimitError: http.get("https://api.gravatar.com/v3/profiles/:hash", () => {
		return new HttpResponse(null, { status: 429 });
	}),

	serverError: http.get("https://api.gravatar.com/v3/profiles/:hash", () => {
		return new HttpResponse(null, { status: 500 });
	}),
};

export const pwnedPasswords = {
	weak: http.get("https://api.pwnedpasswords.com/range/:hash", () => {
		return new Response("d2f5c131c7ab9fbc431622225e430a49ccd");
	}),

	strong: http.get("https://api.pwnedpasswords.com/range/:hash", () => {
		return new Response("1da2f5c1331c7ab39fbc431622225e4f30a49ccd");
	}),
};

export const emailVerifier = {
	valid: http.get("https://verifier.meetchopra.com/verify/:value", () => {
		return HttpResponse.json({ status: true });
	}),

	invalid: http.get("https://verifier.meetchopra.com/verify/:value", () => {
		return HttpResponse.json({
			status: false,
			error: { code: 2, message: "Disposable email address" },
		});
	}),
};
