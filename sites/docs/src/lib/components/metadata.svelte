<script lang="ts">
	import {page} from '$app/state';
	import {siteConfig} from '$lib/config';

	const title = $derived(page.data?.title ? `${page.data.title} - ${siteConfig.name}` : siteConfig.name);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={siteConfig.description} />
	<meta name="keywords" content={siteConfig.keywords} />
	<meta name="author" content="Haniel Ubogu" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={siteConfig.url} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={siteConfig.description} />
	<meta name="twitter:image" content={siteConfig.ogImage} />
	<meta name="twitter:image:alt" content={siteConfig.name} />
	<meta name="twitter:creator" content="hyprsonic_dev" />
	<meta property="og:title" content={title} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteConfig.url + page.url.pathname} />
	<meta property="og:image" content={siteConfig.ogImage} />
	<meta property="og:image:alt" content={siteConfig.name} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:description" content={siteConfig.description} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:locale" content="EN_US" />
</svelte:head>
