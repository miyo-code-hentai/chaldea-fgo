<script lang="ts">
  import { assets } from '@/lib/data'
  let { light = false }: { light?: boolean } = $props()
</script>

<img alt="" class="h-[17px] w-[17px]" src="{assets}/{light ? '774e5.svg' : '93f2e.svg'}" />
