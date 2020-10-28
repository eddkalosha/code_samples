
BPSystem.initialize();

const ENTITY_NAME = 'BUNDLE';
const REST_METHOD = 'BundleFile';

const ENTITY_NAME_LOG = 'BUNDLE_LOG';
const REST_METHOD_LOG = 'OperationLogFile';

const UPDATE_STATUS_INTERVAL  = 1000; //ms

const { isEditMode, isCancelMode } = BPUI.Tools.getPageMode();
const isReadOnly = isEditMode || isCancelMode;

const icons = {
    mainImg: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2MzhCOUMzMDA2ODZFQTExQjEyMkRERUJDRUQ3MTRBMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3QkZDMDNDQThERTUxMUVBQTVERTg1REVERTk5REFDQyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3QkZDMDNDOThERTUxMUVBQTVERTg1REVERTk5REFDQyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2M0Q2QjlBQTFBOEFFQTExQjEyMkRERUJDRUQ3MTRBMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MzhCOUMzMDA2ODZFQTExQjEyMkRERUJDRUQ3MTRBMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PofM1FoAAAJGSURBVHjavNZbSFRBHMfx3Vxzt9SHDIO1KIjsQmQpLZhREVYglQSxEPjaYw8aqRgUIQs+RNBDF3opMIugoIwIIkikMCq1oqKELkh0JaLIXrK278BvYzic1Vl3t4HPg+eM8z/z35n/TDCZTAb+R5vm2C+IMDagH6PYjRLXMYKOM5qF/ViGWxp8M76hE0PZBipWgFpcxQDuYRyrsRE78EH9nqYdyQTyUYSDGMBerELEp18IK9CCh7iIRX5jeh8UoBWDaMdizEjzMbbpCtCMZ+jBAr9Ac7EHj3BInSIOAfwCVmiGIziF+XagT/iIGqUtkKVCLFRmRs2z1NJ8hWGcxi6UaklPpUWwBT14jPf2YujVbKK4hD40oDSDWcxEDJfRj3V6fsVOnQm0xvqnetxBN+pQMkGAMCpxAi/R5Hnfa6fO226iTvvmiPZIjaqDXVWWogXX8Et/n/UbMDRJvo/jPA7gnPJuNu4YtiGOt9iENxMNFHL4cb+iGd1oRwN+oBBt6MtlUQ2onsU1s+9Y7xrEdUbeZrbBvHwdE3YLK21TCmRWzM88nXnjdqAY6vMQZC2q7ECHUa3luzIHAWbjGFp1MP5bDEexRDWqC0+0dzJNpxlvn478+9oSd72r7rnc1l65jgvatC5tOzpUTRJ4YH+o3/IexAtdQuK6IyRUluzLSqot1/s/SpOZwRfXozylDFtVgU1xLEYtEnp/Usd9kyp/2rFcbkHm6+dgJxpRgCje4QbO4DN+5+K6lUpzue5zFVqpr7UHJ21/BRgA2bCfvYpaGH8AAAAASUVORK5CYII=`,
    entityImg:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2MzhCOUMzMDA2ODZFQTExQjEyMkRERUJDRUQ3MTRBMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MTc3RTdCRjhERTUxMUVBODM2M0I3RDJCMjc5RTZGMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MTc3RTdCRThERTUxMUVBODM2M0I3RDJCMjc5RTZGMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2M0Q2QjlBQTFBOEFFQTExQjEyMkRERUJDRUQ3MTRBMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MzhCOUMzMDA2ODZFQTExQjEyMkRERUJDRUQ3MTRBMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pj8cA8MAAAEfSURBVHja1JaBDYIwEEVb4wA6gbiBTiCM4AhOoCPABI4iG6ATgJPIBvXOXE1bWyi0YrzkktJAX3v38wsXQrApYsYmChNUQ4qQ5JwzmVpg6ZTESGKdQl2bGz3CHeHcAsanQE4DWcoHFyiF8YVeHhO40RYyc5aO5lLIKqBkr+/VtX+mOtcOH8IetS9o7vne3jHfxgYdqcFWCStxAy3lIaD7AEkHWVAbKgbfE+1cpbNEGQIqTBD04vqNE1UmCESwBVgTFQQLLv/2PhrqaRubXVCpR/Woy6WZ5tKMnSETElA00FuBdIdJSIZCUV0jCogglQrp61ExktUJ+TiRYYgJ7DTvAayU8Rq+d1qVdpXLPxdUE9Xb1wcPNoi29lQ/kE8BBgBghMz7GoxUeAAAAABJRU5ErkJggg==`,
    spinIcon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZGMUYwQTdCNjM3RTExRUFCQTM1QTMyNjJGMDkwMEVFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZGMUYwQTdDNjM3RTExRUFCQTM1QTMyNjJGMDkwMEVFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkYxRjBBNzk2MzdFMTFFQUJBMzVBMzI2MkYwOTAwRUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkYxRjBBN0E2MzdFMTFFQUJBMzVBMzI2MkYwOTAwRUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4IEI17AAABQUlEQVR42ryWDRGCQBCFPRNcA4lAA4lABCJgAmlABGyAJkASYANtgA1wVx8zOyBwwB07s4PAzX23P75FNU2z28QYZAKjNRF5unj/GaCw+VnmFCSimgUzBtE7TR6T5+QFeQ1YPAe0nwDwyWvyMx6XYslrdTPQfYCT10iXxvMM0USrUyfqkLeATjNEq5uBrj6iyAa6LrbS3ih2JSOx9j9tf6AubIETQRAgrknlSnlke3MkN1dSJ0Fcl/sWINsp+6qJcxDZAVn6C/ItgnwpUxJ0JT9aSptGc5W99hPS41kAJdhLDynDk9VhJcSDjKVjEhTOmTUDo6XCgfWUerdhJwshHI1vNGEFrDCpGepbdyESpFqIUqo3/OjC48KDYrA8PTpKwl0aYs2F/ET7vLsgo88t1C0T3wrSOFXpWNS9iFzbR4ABANocIPToyZ53AAAAAElFTkSuQmCC`,
    boxIcon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY2RTk5RjNBNjM3RjExRUE5MkE4RDRFRDU5ODRBNDk5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjY2RTk5RjNCNjM3RjExRUE5MkE4RDRFRDU5ODRBNDk5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjZFOTlGMzg2MzdGMTFFQTkyQThENEVENTk4NEE0OTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjZFOTlGMzk2MzdGMTFFQTkyQThENEVENTk4NEE0OTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz46SrixAAABY0lEQVR42tyW4VGDQBCFTyrACnLpIHaAFZgSKCFWEDrQDrCDaAWnFUQrQCsIVoDv8K1DMhzsEfSHO/NNBo7cY/duH2eapjERWFA231HyWvXfxOjCghI48AIuwQfY874dnUGZQQXynvEUFOAwluFUgWjBcwXUgnMJjArKgA83g0BfhfzLH2TXvYIaVCAz80TOXfoM3kVZssnAnteriVn0zeFOhYScKcc0peU8FcW6Yy7UsA/gik3p0y9AGng2ZdP65n0CS5brKIacoabANVhw/TYnAgXv1xS4H3MGp6y9lEa27k5ZWhcjJKwD6zAolEzYto/tdu1Zh6FIzB/F/xVa0TJ+I3wLWBHyzXnDppvL69bssUU7f8CnxvrDKfrtyC9DD4vX3fHbohHqftMy7eFEvO6T5dwMlEisyHviW8jrYo5Y3Td1ysx/uGjrpwu/Sbad41dNh7jl71nHrZDX7SK9znwJMABNyaOODJmqzgAAAABJRU5ErkJggg==`,
    checkIcon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFFRTlFRjI4NjM3RjExRUE5NzUxQTBBRTBGREMwRDI4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFFRTlFRjI5NjM3RjExRUE5NzUxQTBBRTBGREMwRDI4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUVFOUVGMjY2MzdGMTFFQTk3NTFBMEFFMEZEQzBEMjgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUVFOUVGMjc2MzdGMTFFQTk3NTFBMEFFMEZEQzBEMjgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz67hRF3AAABP0lEQVR42mL8//8/Az0AEwOdAN0sYqGx+RxAvI7WFrEC8SIgtgbiYAZQYqAR7vkPARHgBEcjS4qhlqTDxGhhSTzUkhYgZqKVRV5QS+aiy1HTEgMg/g7Em4GYi1YWKQLxEyA+DsQC2NQwUqEIEgfibUAsBMRWQPwcqyoKfcIBxNuA+BsQ6+BTS6lFK6Dx4kpILYgoA2ITMizpgKawaGLUg4iDQPwciPVIsCQPakkWsXpAhDDUsrdAbEmEpkQg/gvE7aSEAIwhAsRHgfg3EPvj0eACxD+AeBGpQY3MEQLi7UD8E4gDsCjWhkb8GiDmpMQiEGaBuvY/mmUyQHwfiM8DsSQ5KRSbIBvUMlAQeQMxHxCfAuKnQCxNblbAJcEEtewrEF8C4jfQsoyB2hbBfLYYiD8DsTOl5SHjaHOLXAAQYADc2mQgEdd5HQAAAABJRU5ErkJggg==`,
    gear:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkFBNzZFRDdBQUEwOTExRTdCNDA0Qzk2RUQ2OEMyNENGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkFBNzZFRDdCQUEwOTExRTdCNDA0Qzk2RUQ2OEMyNENGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QUE3NkVENzhBQTA5MTFFN0I0MDRDOTZFRDY4QzI0Q0YiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QUE3NkVENzlBQTA5MTFFN0I0MDRDOTZFRDY4QzI0Q0YiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz72KQe6AAABqElEQVR42rxWi22DMBA1KAO4G7gbeARGYIOyQTMCG3QE2gkYgWxAOgHZADYgdvscXa5nbJQqJz0Jx/je+T6PlOu6qmegVHmmHWaHlWBSOyyXyDpcHAoCT24eIbKI3qOBwzcQUTuT/Ra3HLH+ayyX1mF26BwqPHvrsUffrR0G7I/Y7/CseY04USAJa3/AJAptmeNAlmyGL/K8CClTQgoXsv4W08eYG9xKR6I3SKnZ2J/xzmbqNHLOHfmDE5yEugxC3SzeUzEiDWcdCs9JvB1ZQC2IeVAT9iqJaEYBOyHKiZFQtJHAevi73a74YfudgUIotMFsvCQUo4js3/ymlMGgq2K2/JcE+dauotO+LUFaIrrgmoNDzYhODseIsw+HT/ZbAz/zXTbYDLRoW0mWWjJfBgWXZi40j86ZIysMYr/eWyeQBH1UqYFtY6KYCQ2iOkUk3WYvGulWpSCQ76yrbKIzaVdqnD+nRFUThTgisgmohMiD/s1Yj7nfI0pGnUtSMxBpqong6pxmiKFiH7PQndlNc8hUkBPyv2588DbtsOMf06t6wEr1JLsKMACWibbRQUEf6gAAAABJRU5ErkJggg==`,
    statusIcon:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJFOEM0NTJCOEVBQzExRUE5NkMxQTMwODU4RDA0ODZEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJFOEM0NTJDOEVBQzExRUE5NkMxQTMwODU4RDA0ODZEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkU4QzQ1Mjk4RUFDMTFFQTk2QzFBMzA4NThEMDQ4NkQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkU4QzQ1MkE4RUFDMTFFQTk2QzFBMzA4NThEMDQ4NkQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4DUQxPAAABGUlEQVR42ryWgQ2CQAxFhQkY4UZwBEZgBDbQEdiAERyBEW4E3ODcADc4e+TXlEaNQLlLmjON6TO/12+LGOMpy7ECUZ0+Ls+Nokr1Z4YFiGp0KH5F8ZZiAswUlIp2KtcCPjNKow5UFHeVe5j2CHKlMybZRH6gCLulgzQBsvW4Az6PgDebQfT9msKLl+WQd3gUA27OrwOhEAM8F/pnfBYgSOEhQbob5Cv8cu5DvXZO3yAxBz10HYQ0rH271RAk6NMcMKzb6zwSFLUkaHq0sDg5sE8Krf2F7cXMVLP1SL26cNiryzpHhs7gdzlDdq/74d7+EPdWsMiPR8+h9R9fmsOzyjnz5UTtDO6wnUHApm9bUJFrrytPmc5LgAEAzazM4J8gydQAAAAASUVORK5CYII=`,
    lockIcon:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAAHeTXxYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQyMTJBNkQ4OUU3QzExRUFBQUQ1QUMwN0VEQUQxNDUwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjQyMTJBNkQ5OUU3QzExRUFBQUQ1QUMwN0VEQUQxNDUwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDIxMkE2RDY5RTdDMTFFQUFBRDVBQzA3RURBRDE0NTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDIxMkE2RDc5RTdDMTFFQUFBRDVBQzA3RURBRDE0NTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6jWi6zAAABsklEQVR42mL8//8/AwpAFgCxmRjQAAu6KoAAYsQwA91AAQxlAAEENwBIn4fS7+HiIAKmDcNtuGwDiQMEEG6nINmXgOwqmF37kRQ2YAQEkuR/JmSVQHwfa9Ah68DpKoAAglmOTTwBiB1wBgCSdxyA2ACbtfg07cfhmgacmpAkQDbuh0UYso1Y0ws47hkZD0CZE/EGxH/iwHmQWoAAIpDuGPAnBCx+SsAZPWiZQgA52qFxdZ6Qpv9YTDeAxR0uTQ04vLAfWRMTAzkAFtxEqFNAcR66Jmic7EdPh4Sc9wCIA4HYgWjnQXPcflzxBEsR/4HpjZHYhMAC5V/4T1x6YiSizMMOAAKMvARLBmBCy3sYGAhApR8odb2H4v1Q/B/Kb8CmDyNYkfIt1mQKzasC+CoHqJr1eMoE3BYB+f3YNOOx8Dx6vkI2G19eAqXuiyREw0YgtieU/2D4/H/qgfPIZqOnOryZA5TZgRSsJFwAVPoAj9r/sPyAzUf/8WhsQKtyz+Mq65CrFpJ9BE15IIs+QIVAfEeg8g9U9RGSr2CggYDa/ziTN1RSgNJSAFpw4w06+hRBtAQA5c26gVaDuxgAAAAASUVORK5CYII=`,
}

const status = 'IN PROGRESS';
const BUNDLE_ID = BPSystem.nodeKey;
const loadingText = 'Loading...';

const fileUrl = `${BPSystem.bpRestApiUrl}/files/${ENTITY_NAME}/${BUNDLE_ID}/${REST_METHOD}`;

const query = `
    SELECT b.name, 
    (SELECT COUNT(*) FROM bundle_content c WHERE c.cd_bundle_id = b.cd_bundle_id) AS content_count, 
    Trunc_YYYY_MM_DD(b.created) AS created, 
    b.LastErrorMessage,
    b.status 
    FROM bundle b 
    WHERE b.cd_bundle_id = ${BUNDLE_ID}
`;

const rotateAnimation = {
    '-webkit-animation': 'spin 2s linear infinite',
    '-moz-animation': 'spin 2s linear infinite',
    'animation': 'spin 2s linear infinite'
};

const bundleStatus = {
    'IN PROGRESS': {
        mainColor: '#fcb700',
        secondaryColor: '',
        icon: icons.statusIcon,
        name: 'IN PROGRESS',
        actionsContent: (<i>[No actions]</i>)
    },
    BUILDING: {
        mainColor: '#fcb700',
        secondaryColor: '',
        icon: icons.gear,
        name: 'BUILDING',
        styles: rotateAnimation,
        bgColorIcon:'#fcb700',
        actionsContent: (<i>[No actions]</i>)
    },
    'BUILT(Ready to Export)': {
        mainColor: '#6ed7b3',
        secondaryColor: '',
        icon: icons.lockIcon,
        name: 'BUILT(Ready to Export)',
        actionsContent: (<i>[No actions]</i>)
    },
    'BUILT(Exported)': {
        mainColor: '#6ed7b3',
        secondaryColor: '',
        icon: icons.lockIcon,
        name: 'BUILT(Exported)',
        actionsContent: (<i>[No actions]</i>)
    },
    'BUILT(Ready to Deploy)': {
        mainColor: '#6ed7b3',
        secondaryColor: '',
        icon: icons.lockIcon,
        name: 'BUILT(Ready to Deploy)',
        bgColorIcon:'#fcb700',
        actionsContent: (<i>[No actions]</i>)
    },
    DEPLOYING: {
        mainColor: '#fcb700',
        secondaryColor: '',
        icon: icons.gear,
        name: 'DEPLOYING',
        styles: rotateAnimation,
        bgColorIcon:'#fcb700',
        actionsContent: (<i>[No actions]</i>)
    },
    DEPLOYED: {
        mainColor: '#93d24d',
        secondaryColor: '',
        icon: icons.checkIcon,
        name: 'DEPLOYED',
        actionsContent: (<i>[No actions]</i>)
    },
    REVERT: {
        mainColor: '#fcb700',
        secondaryColor: '',
        icon: icons.gear,
        name: 'REVERT',
        styles: rotateAnimation,
        bgColorIcon:'#fcb700',
        actionsContent: (<i>[No actions]</i>)
    }
};

const TILES_OPTIONS = {
    tile1: {
        positions: { alignY: 'center', primary: 'flex-start', secondary: 'flex-start',iconX:'left', iconY: 'center'  },
        colors: { bg: '#FFF', primary: 'grey', secondary: '#000' },
        primary: 'BUNDLE NAME:',
        secondary: '- Unknown -',
        icon: (<div style={{background:'#5cc3ff',padding:'8px'}}><img width="30" height="30" src={icons.mainImg}></img></div>)  
    },
    tile2: {
        positions: { alignY: 'center', primary: 'flex-start', secondary: 'flex-start',iconX:'left', iconY: 'center'  },
        colors: { bg: '#FFF', primary: 'grey', secondary: '#000' },
        primary: 'ENTITY COUNT:',
        secondary: '0',
        icon: (<div style={{background:'#6ed7b3',padding:'8px'}}><img width="30" height="30" src={icons.entityImg}></img></div>)
    },
    tile4: {
        positions: { alignY: 'center', primary: 'flex-start', secondary: 'flex-start',iconX:'left', iconY: 'center'  },
        colors: { bg: '#FFF', primary: 'grey', secondary: '#000' },
        primary: 'STATUS:',
        secondary: bundleStatus[status].name,
        icon: (<div style={{background: bundleStatus[status].bgColorIcon || 'yellowgreen',padding:'8px'}}><img style={bundleStatus[status].styles} width="30" height="30" src={bundleStatus[status].icon}></img></div>)
    },
    tile5: {
        positions: { alignY: 'center', primary: 'center', secondary: 'center' },
        colors: { bg: '#FFF', primary: 'grey' },
        primary: 'ACTIONS:',
        secondary: bundleStatus[status].actionsContent
    }
};


const HeaderDataWrapper = React.createClass({
    getInitialState() {
        return {
            loading: true,
            error: null,
            errorFile:null,
            exportFile: this.exportFromBase64File.bind(this,fileUrl),
            status: '',
            fileContent: '',
            ...TILES_OPTIONS
        }
    },
    async getData() {
        try {
            const res = await BPConnection.Bundle.queryAsync(query).single();
            let {LastErrorMessage:error,status} = res;
            let errorFile = null; 
            if (error){
                const posStart = error.indexOf('BundleLogId[');
                const posEnd = error.indexOf(']');
                if (posStart<posEnd){
                    const errorFileData = String(error).substring(posStart,posEnd+1);
                    error = error.replace(errorFileData,'');
                    const posStartTmp = errorFileData.indexOf('[')+1;
                    const endStartTmp = errorFileData.indexOf(']');
                    const fileId = errorFileData.substring(posStartTmp,endStartTmp);
                    if (fileId){
                        errorFile = (<a className='download-link-error' src="javascript:void(0)" onClick={()=>this.downloadErrorFile(fileId)}>Download LOG file</a>)
                    }
                }
            }
            this.setState({
                status,
                error,
                errorFile
            })
            return res;
        } catch (e) {
            console.log(e);
            this.setState({
                showError: false
            })
            return false;
        }
    },
    async getBundleData() {
        try {
            return await BPConnection.Bundle.queryAsync(query).single();
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    generateButton(name = '', onClickAction, color='rgb(193, 193, 193)', textColor='#FFF') {
        //btn-labeled fa fa-share-alt
        //btn-labeled fa fa-eye 
        const nameLower = String(name).toLowerCase();
        const title = ['build', 'deploy', 'preview', 'export', 'import', 'revert'].includes(nameLower);
        return title ? (
            <BPUI.Button
                style={{ borderColor: color, backgroundColor: color, color:textColor }}
                className={`actionButton ${isReadOnly && nameLower==='build'?'disabled':''}`} 
                onClick={e => onClickAction(e, name)}
                title={name}
            />) :
            null;
    },

    async actionAfter(preview){
        const statusPrev = this.state.status;
        if (statusPrev=='BUILT(Ready to Export)'){
        await BPConnection.Bundle.upsert([{
            Id: BUNDLE_ID, 
            Status: preview===1?statusPrev:'BUILT(Exported)' 
        }]); 
        this.loadData();
        const a = setInterval(() => {
            this.loadData();
            if ((preview===1 && this.state.status === 'BUILT(Ready to Export)') || (preview!==1 && this.state.status==='BUILT(Exported)') ){
                clearTimeout(a);
            }
        }, 2000);
    }
    },

    async exportFromBase64File(path,isClearDownload) {
        const fileDownloadResult = await fetch(path, { headers: { sessionid: BPSystem.sessionId } });
        if (fileDownloadResult) {
            //get data
            const fileDownloadData = await fileDownloadResult.json();
            const { Data: fileContent } = fileDownloadData.fileDownloadResponse[0];
            const { FileName: fileName } = fileDownloadData.fileDownloadResponse[0];
            if (!isClearDownload) this.setState({ fileContent });
            //prepare & save data
            const blob = new Blob([window.atob(fileContent)]);
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            this.actionAfter(); 
        }
    },
    async showPreviewFile(path) {
        const fileDownloadResult = await fetch(path, { headers: { sessionid: BPSystem.sessionId } });
        if (fileDownloadResult) {
            //get data
            const fileDownloadData = await fileDownloadResult.json();
            const { Data: fileData } = fileDownloadData.fileDownloadResponse[0];
            //prepare & show data
            const fileContent = window.atob(fileData);
            this.setState({ fileContent });
            window.BPActions.showDialog('previewDialog', {
                title: 'File Content Preview',
            });
            setTimeout(() => {
                const editor = window.CodeMirror.fromTextArea(document.getElementById("fileContent"), {
                    lineNumbers: true,
                    readOnly: true,
                    mode: "htmlmixed"
                });
                //editor.autoFormatRange({line:0, ch:0}, {line:editor.lineCount()});
            }, 200);
            this.actionAfter(1);
        }
    },
    downloadErrorFile(id){
        this.exportFromBase64File(`${BPSystem.bpRestApiUrl}/files/${ENTITY_NAME_LOG}/${id}/${REST_METHOD_LOG}`,true)
    },
    async actionButtonClick(e, name) {
        switch (name) {
            case 'Export': this.exportFromBase64File(fileUrl); this.loadData(); break;
            case 'Preview': this.showPreviewFile(fileUrl); this.loadData(); break;
            case 'Build': {
                try {
                    const statusSrc = bundleStatus["IN PROGRESS"].name;
                    const statusMid = bundleStatus.BUILDING.name;
                    const statusDest = bundleStatus["BUILT(Ready to Export)"].name;
                    // statusSrc -> statusMid -> statusDest
                    this.setData({ ...this.state.data, status: statusMid });
                    const updateStatusResponse = await BPConnection.Bundle.upsert([{ Id: BUNDLE_ID, Status: statusMid }])
                    let that = this;
                    if (updateStatusResponse){ 
                        let countDown = 100; //secounds to wait mid status
                        setTimeout(function run() { 
                            that.getBundleData().then(result => { 
                                const {status,LastErrorMessage} = result;
                                console.log('1. before build status = ',status);
                                let timerId;
                                let oracleJobDelay = 8;//1-6 sec before job will start 
                                if (countDown>100-oracleJobDelay){
                                    console.log('waiting job delay start...');
                                    countDown--;
                                    timerId = setTimeout(run, 1000); // recurse call (beware)
                                }else{
                                    if (status === statusDest || status === statusMid || countDown===0 || LastErrorMessage ) { 
                                        console.log('success');
                                        clearTimeout(timerId);
                                        runAfter();
                                        return;
                                    }else{
                                        console.log('waiting...');
                                        countDown--;
                                        timerId = setTimeout(run, 1000); // recurse call (beware)
                                    }
                                }
                            })}, 1000); 
                    } 
                    const runAfter = () => {
                        setTimeout(function run2() { 
                            that.getBundleData().then(result => { 
                                const {status} = result;
                                console.log('2. waiting correct status = ',status); 
                                if (status === statusSrc || status === statusDest) { 
                                    clearTimeout(timerId2);
                                    that.loadData();
                                    return;
                                }
                            }) 
                            let timerId2 = setTimeout(run2, 1000*2); // recurse call (beware)
                        }, 1000*2); 
                    }  
                }
                catch (e) {
                    this.setState({ showError: false })
                }

                break;
            }
            case 'Deploy': { 
                try {
                    const statusSrc = bundleStatus["BUILT(Ready to Deploy)"].name;
                    const statusMid = bundleStatus.DEPLOYING.name;
                    const statusDest = bundleStatus.DEPLOYED.name ;
                    // statusSrc -> statusMid -> statusDest
                    this.setData({ ...this.state.data, status: statusMid });
                    const updateStatusResponse = await BPConnection.Bundle.upsert([{ Id: BUNDLE_ID, Status: statusMid }])
                    let that = this;
                    if (updateStatusResponse){ 
                        let countDown = 100; //secounds to wait mid status
                        setTimeout(function run() { 
                            that.getBundleData().then(result => { 
                                const {status,LastErrorMessage} = result;
                                console.log('1. before build status = ',status);
                                let timerId;
                                let oracleJobDelay = 8;//1-6 sec before job will start 
                                if (countDown>100-oracleJobDelay){
                                    console.log('waiting job delay start...');
                                    countDown--;
                                    timerId = setTimeout(run, 1000); // recurse call (beware)
                                }else{
                                    if (status === statusDest || status === statusMid || countDown===0 || LastErrorMessage  ) { 
                                        console.log('success',status,LastErrorMessage);
                                        clearTimeout(timerId);
                                        runAfter();
                                        return;
                                    }else{
                                        console.log('waiting...');
                                        countDown--;
                                        timerId = setTimeout(run, 1000); // recurse call (beware)
                                    }
                                }
                            })}, 1000); 
                    } 
                    const runAfter = () => {
                        setTimeout(function run2() { 
                            that.getBundleData().then(result => { 
                                const {status} = result;
                                console.log('2. waiting correct status = ',status);
                                if (status === statusSrc || status === statusDest) { 
                                    clearTimeout(timerId2);
                                    that.loadData();
                                    return;
                                }
                            }) 
                            let timerId2 = setTimeout(run2, 1000*2); // recurse call (beware)
                        }, 1000*2); 
                    }  
                }
                catch (e) {
                    this.setState({ showError: false })
                } 
                break; 
            }
            case 'Revert': { 
                    this.setData({ ...this.state.data, status: bundleStatus.REVERT.name });
                    const updateStatusResponse = await BPConnection.Bundle.upsert([{ Id: BUNDLE_ID, Status: bundleStatus.REVERT.name }])
                    if (updateStatusResponse){
                        let that = this;
                        let countDown = 10;
                        setTimeout(function run() { 
                            that.getBundleData().then(result => { 
                                const {status,LastErrorMessage} = result;
                                if (status === bundleStatus['IN PROGRESS'].name || countDown===0 || LastErrorMessage ) { 
                                    clearTimeout(timerId);
                                    that.loadData();
                                    return;
                                }
                            })
                            countDown--;
                            let timerId = setTimeout(run, 1000); // recurse call (beware)
                          }, 1000); 
                    }  
                 
                break;
            }
        }
    },
    setData({ name, content_count, created, status }) {
        let actionContent = '';
        switch (status) {
            case bundleStatus["BUILT(Ready to Deploy)"].name: actionContent = (<React.Fragment>
                {this.generateButton('Export', this.actionButtonClick, 'rgb(92, 195, 255)')}
                {this.generateButton('Deploy', this.actionButtonClick, 'rgb(92, 195, 255)')}
                {this.generateButton('Preview', this.actionButtonClick)}
            </React.Fragment>); break;
            case bundleStatus["BUILT(Ready to Export)"].name: actionContent = (<React.Fragment>
                {this.generateButton('Export', this.actionButtonClick,  'rgb(92, 195, 255)')}
                {this.generateButton('Preview', this.actionButtonClick,  'rgb(92, 195, 255)')}
                {this.generateButton('Revert', this.actionButtonClick )}
            </React.Fragment>); break;
            case bundleStatus["BUILT(Exported)"].name: actionContent = (<React.Fragment>
                {this.generateButton('Export', this.actionButtonClick,  'rgb(92, 195, 255)' )}
                {this.generateButton('Preview', this.actionButtonClick,  'rgb(92, 195, 255)')}
            </React.Fragment>); break;
            case bundleStatus["IN PROGRESS"].name: actionContent = (<React.Fragment>
                {this.generateButton('Build', this.actionButtonClick,'rgb(92, 195, 255)')}
            </React.Fragment>); break;
            case bundleStatus.DEPLOYED.name: actionContent = (<React.Fragment>
                {this.generateButton('Export', this.actionButtonClick, 'rgb(92, 195, 255)')}
            </React.Fragment>); break;
            default: actionContent = (<i>[No actions]</i>);
        }


        this.setState({
            loading: false,
            showError: false,
            data: { name, content_count, created, status },
            tile1: {
                ...this.state.tile1,
                secondary: name,
            },
            tile2: {
                ...this.state.tile2,
                secondary: content_count
            },
            tile4: {
                ...this.state.tile4,
                colors: {
                    ...this.state.tile4.colors
                },
                secondary: bundleStatus[status].name,
                icon: (<div style={{background: bundleStatus[status].bgColorIcon || 'yellowgreen',padding:'8px'}}><img style={bundleStatus[status].styles} width="30" height="30" src={bundleStatus[status].icon}></img></div>)
            },
            tile5: {
                ...this.state.tile5,
                secondary: actionContent
            }
        })
    },
    async loadData() {
        const data = await this.getData();
        if (data) {
            this.setData(data);
        } else {
            this.setState({
                loading: false,
                showError: false
            })
        }
    },
    async componentDidMount() {
        this.loadData()
    },
    render() {
        const { render } = this.props;
        return (
            <React.Fragment>
                {render(this.state)}
            </React.Fragment>
        )
    }
});


 