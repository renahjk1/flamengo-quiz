import { useEffect, useState } from "react";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
}

const UTM_STORAGE_KEY = "utmParams";

// Get UTM params from URL
function getUTMFromURL(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  const keys: (keyof UTMParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "src",
    "sck",
  ];

  keys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

// Save UTM params to sessionStorage
function saveUTMToStorage(params: UTMParams): void {
  if (Object.keys(params).length > 0) {
    const existingParams = getUTMFromStorage();
    const mergedParams = { ...existingParams, ...params };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(mergedParams));
  }
}

// Get UTM params from sessionStorage
export function getUTMFromStorage(): UTMParams {
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading UTM from storage:", e);
  }
  return {};
}

// Build URL with UTM params
export function buildURLWithUTM(baseURL: string): string {
  const utmParams = getUTMFromStorage();
  if (Object.keys(utmParams).length === 0) {
    return baseURL;
  }

  const url = new URL(baseURL, window.location.origin);
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.pathname + url.search;
}

// Hook to capture and manage UTM params
export function useUTM() {
  const [utmParams, setUtmParams] = useState<UTMParams>({});

  useEffect(() => {
    // Get UTM from URL first
    const urlParams = getUTMFromURL();
    
    // Save to storage if we have new params
    if (Object.keys(urlParams).length > 0) {
      saveUTMToStorage(urlParams);
    }
    
    // Get merged params from storage
    const storedParams = getUTMFromStorage();
    setUtmParams(storedParams);
  }, []);

  return {
    utmParams,
    buildURLWithUTM,
    getUTMFromStorage,
  };
}

export default useUTM;
