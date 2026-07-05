<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.category.name} · 릴토끼</title></svelte:head>
<h1>{data.category.name}</h1>
<p class="muted">아직 등록된 게시글이 없습니다.</p>
