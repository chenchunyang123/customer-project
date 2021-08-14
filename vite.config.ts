// noinspection TypeScriptUnresolvedVariable

import {defineConfig} from 'vite'
import reactRefresh   from '@vitejs/plugin-react-refresh'
// @ts-ignore
import path           from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh()],
    alias:   [
        {find: /^~/, replacement: '',},
        // @ts-ignore
        {find: "@", replacement: path.resolve(__dirname, 'src')}
    ],
    server:  {
        proxy: {
            '/api': {
                target:       'http://localhost:10001',
                changeOrigin: true,
                rewrite:      path1 => path1.replace(/^\/api/, '')
            }
        }
    },
    css:     {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars:        {
                    "border-radius-base": "2px",
                    "modal-footer-bg":    "#e2e2e254",
                    "primary-color":      "#096dd9",
                    "modal-header-bg":    "#112a45",
                    "modal-close-color":  "#e3e3e3e3"
                },
            },
        },
    }
})
