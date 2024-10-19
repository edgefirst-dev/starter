import { URLPattern } from "urlpattern-polyfill";

export default function redirects(url: URL): Array<Redirect> {
	return [
		{
			source: new URLPattern("/home", url.toString()),
			destination: "/",
			permanent: false,
		},
	];
}

interface Redirect {
	source: URLPattern;
	destination: string;
	permanent: boolean;
}
