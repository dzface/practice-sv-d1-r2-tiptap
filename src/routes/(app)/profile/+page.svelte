<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>프로필 · 릴토끼</title></svelte:head>

<section class="box">
	<h1>{data.profile.nickname}</h1>
	<dl>
		<div>
			<dt>역할</dt>
			<dd>{data.profile.role}</dd>
		</div>
		<div>
			<dt>포인트</dt>
			<dd>{data.profile.points}</dd>
		</div>
	</dl>
</section>

<style>
	dl {
		display: grid;
		gap: 0.75rem;
	}

	dl div {
		display: flex;
		gap: 0.75rem;
	}

	dt {
		color: var(--muted);
	}
</style>
