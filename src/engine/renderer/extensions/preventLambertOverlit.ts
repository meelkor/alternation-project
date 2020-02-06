import { ShaderChunk } from 'three';

/**
 * Change lambert material shader so it doesn't combine light sources in a way
 * that would cause nuclear explosion effect.
 *
 * @todo make it so it still combines the lights, but only allows brightness
 * to be like 1.2 of the original
 */
export function preventLambertOverlitExtension() {
    ShaderChunk.lights_lambert_vertex = ShaderChunk.lights_lambert_vertex.replace(
            `#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;
		#endif
	}`,
			`vec3 maxLight = vec3(0.0); vec3 currentLight = vec3(0.0);
			#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;

		currentLight = saturate( dotNL ) * directLightColor_Diffuse;

		if (all(lessThan(maxLight, currentLight)))
			maxLight = currentLight;
	}
	vLightFront += maxLight;`,
        );
}
