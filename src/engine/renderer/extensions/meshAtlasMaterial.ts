import { MeshLambertMaterial } from 'three';

/**
 * Add condition branches to Lambert material (which is this extension based on)
 * for tile atlas handling.
 */
export function meshAtlasMaterialExtension(): void {
    const origOnBeforeCompile = MeshLambertMaterial.prototype.onBeforeCompile;
    MeshLambertMaterial.prototype.onBeforeCompile = function (shader, renderer) {
        origOnBeforeCompile(shader, renderer);

        shader.uniforms.uAtlasSize = { value: new Float32Array([
            this.userData.atlasColumns,
            this.userData.atlasRows,
        ]) };

        shader.fragmentShader = /* glsl */`
            #ifdef ATLAS_EXTENSION
            varying vec2 vUvt2;
            varying vec3 vUvt2Mask;
            #endif
        ` + shader.fragmentShader.replace('#include <map_fragment>', /* glsl */`
            #ifdef USE_MAP

            #ifdef ATLAS_EXTENSION

            vec4 texelColor = vec4(texture2D( map, vUv ).rgb, 1);

            if (vUvt2.y >= 0.0) {
                float alpha;
                int band = int(vUvt2Mask.z);

                if (band == 0)
                    alpha = texture2D(map, vUvt2Mask.xy).r;
                else if (band == 1)
                    alpha = texture2D(map, vUvt2Mask.xy).g;
                else if (band == 2)
                    alpha = texture2D(map, vUvt2Mask.xy).b;
                else if (band == 3)
                    alpha = texture2D(map, vUvt2Mask.xy).a;

                texelColor = mix(texelColor, vec4(texture2D(map, vUvt2).rgb, 1.0), alpha);
            }

            #else
            vec4 texelColor = texture2D( map, vUv );
            #endif
            texelColor = mapTexelToLinear( texelColor );
            diffuseColor *= texelColor;
            #endif
        `);


        shader.vertexShader = /* glsl */`
            #ifdef ATLAS_EXTENSION
            attribute vec2 aTile0;
            attribute vec4 aTile1;
            attribute vec4 aTile2;
            uniform vec2 uAtlasSize;

            vec2 rotate(vec2 ruv, float r) {
                if (r == 1.0 || r == 3.0) {
                    ruv = ruv.yx;
                }
                if (r > 1.0) {
                    ruv = vec2(1.0, 1.0) - ruv * -1.0;
                }
                return ruv;
            }

            varying vec2 vUvt2;
            varying vec3 vUvt2Mask;

            #endif
        ` + shader.vertexShader.replace(`#include <uv_vertex>`, /* glsl */`
            #ifdef USE_UV
            #ifdef ATLAS_EXTENSION

            vUv = rotate(uv, aTile0.y) / uAtlasSize + vec2(mod(aTile0.x / 4.0, uAtlasSize.x), floor(aTile0.x / 4.0 / uAtlasSize.x)) / uAtlasSize;

            vUvt2 = rotate(uv, aTile1.y) / uAtlasSize + vec2(mod(aTile1.x / 4.0, uAtlasSize.x), floor(aTile1.x / 4.0 / uAtlasSize.x)) / uAtlasSize;
            vUvt2Mask = vec3(rotate(uv, aTile1.w) / uAtlasSize + vec2(mod(floor(aTile1.z / 4.0), uAtlasSize.x), floor(floor(aTile1.z / 4.0) / uAtlasSize.x)) / uAtlasSize, fract(aTile1.z / 4.0) * 4.0);

            #else
            vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
            #endif
            #endif
        `);

    };

}
