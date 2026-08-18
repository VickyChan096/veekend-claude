<script lang="ts" setup>
import ExampleSection from '@/components/pages/example/ExampleSection.vue'

const open = defineModel<boolean>({ default: false })

const scales = [
  { name: 'head1', px: '32px' },
  { name: 'head2', px: '24px' },
  { name: 'subtitle1', px: '20px' },
  { name: 'subtitle2', px: '18px' },
  { name: 'body1', px: '16px' },
  { name: 'body2', px: '14px' },
]
</script>

<template>
  <ExampleSection v-model="open" title="字級" note="六階字級 × bold / medium / regular，mixin 寫法：@include head1-bold">
    <p class="display-sample">Veekend</p>
    <p class="display-note">@include display（Archivo Black，英文大標用）</p>

    <table class="font-table">
      <thead>
        <tr>
          <th scope="col">名稱</th>
          <th scope="col">大小</th>
          <th scope="col">bold</th>
          <th scope="col">medium</th>
          <th scope="col">regular</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="scale in scales" :key="scale.name">
          <td><code>{{ scale.name }}</code></td>
          <td>{{ scale.px }}</td>
          <td :class="`${scale.name}-bold`">週末</td>
          <td :class="`${scale.name}-medium`">週末</td>
          <td :class="`${scale.name}-regular`">週末</td>
        </tr>
      </tbody>
    </table>
  </ExampleSection>
</template>

<style lang="scss" scoped>
.display-sample {
  @include display;
  font-size: 3rem;
  color: var(--title);
}
.display-note {
  @include body2-regular;
  margin-bottom: 16px;
  color: var(--subtitle);
}
.font-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px;
    text-align: start;
    border-bottom: 1px solid var(--divider);
  }
  th {
    @include body2-bold;
    color: var(--subtitle);
  }
  code {
    @include body2-regular;
    color: var(--subtitle);
  }
}

.head1-bold { @include head1-bold; }
.head1-medium { @include head1-medium; }
.head1-regular { @include head1-regular; }
.head2-bold { @include head2-bold; }
.head2-medium { @include head2-medium; }
.head2-regular { @include head2-regular; }
.subtitle1-bold { @include subtitle1-bold; }
.subtitle1-medium { @include subtitle1-medium; }
.subtitle1-regular { @include subtitle1-regular; }
.subtitle2-bold { @include subtitle2-bold; }
.subtitle2-medium { @include subtitle2-medium; }
.subtitle2-regular { @include subtitle2-regular; }
.body1-bold { @include body1-bold; }
.body1-medium { @include body1-medium; }
.body1-regular { @include body1-regular; }
.body2-bold { @include body2-bold; }
.body2-medium { @include body2-medium; }
.body2-regular { @include body2-regular; }
</style>
