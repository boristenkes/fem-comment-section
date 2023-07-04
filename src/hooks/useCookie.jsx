export default function useCookie({
	key,
	value,
	expDays = 2,
	destroy = false
}) {
	if (destroy)
		return (document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`);

	const cookies = document.cookie.split('; ');
	const cookiesObj = {};

	cookies.forEach(cookie => {
		const [key, value] = cookie.split('=');
		cookiesObj[key] = value;
	});

	if (!value) return cookiesObj[key];

	const d = new Date();
	d.setTime(d.getTime() + expDays * 24 * 60 * 60 * 1000);
	document.cookie = `${key}=${value};expires=${d.toUTCString()}`;
}
