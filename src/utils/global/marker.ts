import markerSDK from '@marker.io/browser';
export async function initMarker() {
  // Only load marker if URL contains 'webflow'
  if (window.location.href.includes('webflow')) {
    await markerSDK.loadWidget({
      project: '68598778ac7f5e6befddb67f',
    });
  }
}
