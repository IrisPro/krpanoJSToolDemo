import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

export default defineConfig({
    base: './',
    assetsInclude: [
        '**/*.temphtml',
        '**/*.exe',
        '**/*.swf',
        '**/*.zip',
        '**/*.xml',
        '**/*.lqr',
        '**/预览全景',
    ],
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
})
