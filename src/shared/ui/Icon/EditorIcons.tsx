import React from 'react';

interface IconProps {
  className?: string;
}

const PlaceholderSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 32 32" fill="#ffffff">
    <path fill="#ffffff" d="m27.188 5.094l-11.063 5.25A2.024 2.024 0 0 0 15 10a1.999 1.999 0 1 0 0 4c1.05 0 1.922-.813 2-1.844l6.063-2.875C24.878 10.047 26 11.047 26 12c0 1.887-4.277 4-10 4S6 13.887 6 12s4.277-4 10-4c.172 0 .328-.004.5 0l3.531-1.656A24.224 24.224 0 0 0 16 6C9.16 6 4 8.578 4 12v10c0 .988.445 1.895 1.125 2.625c.68.73 1.605 1.32 2.688 1.813C9.976 27.422 12.84 28 16 28c3.16 0 6.023-.578 8.188-1.563c1.082-.492 2.007-1.082 2.687-1.812C27.555 23.895 28 22.988 28 22V12c0-1.477-.977-2.79-2.625-3.813l2.656-1.28zM6 15.406c1.016.766 2.379 1.395 4 1.844v7.906c-.5-.156-.957-.34-1.375-.531c-.906-.414-1.598-.91-2.031-1.375C6.16 22.785 6 22.395 6 22zm20 0V22c0 .395-.16.785-.594 1.25c-.433.465-1.125.96-2.031 1.375c-.418.191-.875.375-1.375.531V17.25c1.621-.45 2.984-1.078 4-1.844zm-14 2.281A24.4 24.4 0 0 0 16 18a24.4 24.4 0 0 0 4-.313v7.938c-1.23.23-2.578.375-4 .375c-1.422 0-2.77-.145-4-.375z"/>
  </svg>
);

export const KickDrumIcon = (props: React.SVGProps<SVGSVGElement>) => <PlaceholderSvg {...props} />;
export const SnareDrumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 16 16" fill="#ffffff">
    <path fill="#ffffff" d="M8 3c4.55 0 6.88 1.06 7 2.4l.004.103v5c0 1.54-3.12 2.5-7 2.5s-7-.961-7-2.5v-5c0-1.38 2.33-2.5 7-2.5zm6 3.91a5.3 5.3 0 0 1-1.02.459q.02.064.02.134v1a.5.5 0 0 1-1 0v-.865a15 15 0 0 1-2.01.289a.4.4 0 0 1 .007.077v1a.5.5 0 0 1-1 0v-1L9 7.986a27 27 0 0 1-2 0l.002.018v1a.5.5 0 0 1-1 0v-1l.007-.077a15.5 15.5 0 0 1-2.01-.288v.865a.5.5 0 0 1-1 0v-1q0-.07.018-.135a5.4 5.4 0 0 1-1.02-.457v3.59c0 .67 2.7 1.5 6 1.5s6-.83 6-1.5L14 6.912zM8 4c-3.88 0-6 .823-6 1.5S4.12 7 8 7s6-.823 6-1.5S11.88 4 8 4"/>
  </svg> 
);

export const HiHatClosedDrumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 16 16" fill="#ffffff">
    <path fill="#ffffff" d="M14.4 9.66a.5.5 0 0 1-.004.707c-1.03 1.02-3.38 1.58-6.39 1.63l-.002 2.5a.5.5 0 0 1-1 0v-2.5c-2.97-.054-5.3-.597-6.35-1.59a.5.5 0 1 1 .687-.727c.867.821 3.2 1.32 6.16 1.32c3 0 5.34-.513 6.19-1.35a.5.5 0 0 1 .707.005zM7.5 0a.5.5 0 0 1 .5.5v2.24c.879.132 1.66.619 2.34 1.44C13.07 4.547 15 5.49 15 7c0 1.95-3.2 2.95-7.21 3l-.287.002c-4.14 0-7.5-1-7.5-3c0-1.51 1.93-2.46 4.66-2.82c.683-.822 1.46-1.31 2.34-1.44V.502a.5.5 0 0 1 .5-.5zm.501 3.76v.745a.5.5 0 0 1-1 0V3.76c-.965.217-1.81 1.08-2.55 2.66a.501.501 0 0 1-.908-.423q.11-.234.224-.453l.115-.214l-.128.026c-1.74.364-2.76.985-2.76 1.65c0 1.06 2.56 2 6.5 2s6.5-.943 6.5-2c0-.683-1.07-1.32-2.89-1.68q.175.317.34.671a.5.5 0 0 1-.906.423c-.735-1.57-1.58-2.44-2.55-2.66z"/>
  </svg>
);

export const HiHatOpenDrumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 48 48" fill="#ffffff">
    <path fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" d="m4.8 23.1l38.7-12.4v-.5l-17.9.7c-3.8-2.2-5.1-.6-6 1.8l-15 9.8ZM23.15 40V21.18"/>
    <path fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" d="m21.68 17.67l.21 2.27l1.26 1.24l1.42-1.52l.2-2.96m-4.86-8.11l2.4-.92m-.19 3.45l-1.01-2.99"/>
  </svg>
);

export const ClapSoundIcon = (props: React.SVGProps<SVGSVGElement>) =>  (
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 32 32" fill="#ffffff">
    <path fill="#ffffff" d="M8.052 4.817a.45.45 0 0 0 .81-.248L9 2.5a.457.457 0 0 0-.58-.475l-1.36.423a.468.468 0 0 0-.23.723l1.222 1.646Zm-2.36 1.622l-1.86-.78a.443.443 0 0 1-.15-.72l.97-1.03a.45.45 0 0 1 .73.11l.89 1.81a.452.452 0 0 1-.58.61Zm24.122 4.137a3.31 3.31 0 0 1 1.139 2.311v9.445a8.406 8.406 0 0 1-3.892 7.533a7.923 7.923 0 0 1-4.121 1.121a8.733 8.733 0 0 1-2.86-.486a7.965 7.965 0 0 1-2.744.491a8.281 8.281 0 0 1-6.724-3.343l-3.471-5.667l-2.5-4.22a3.305 3.305 0 0 1 .844-4.079c.225-.153.464-.283.715-.389a3.157 3.157 0 0 1 1.1-3.58c.22-.135.45-.25.69-.343c-.032-.259-.03-.52.007-.779a3.148 3.148 0 0 1 1.5-2.25a3.207 3.207 0 0 1 3.546.277c.168-.179.36-.334.569-.463a2.872 2.872 0 0 1 2.147-.329a3.52 3.52 0 0 1 1.323-.095a2.83 2.83 0 0 1 1.539.666c.171-.182.366-.341.579-.473a3.005 3.005 0 0 1 4.108 1.053l2.072 3.7a2.973 2.973 0 0 1 2.091-.9a3.309 3.309 0 0 1 2.343.8Zm-11.848 3.77h-.006l-.037.025l.026-.016l.017-.01Zm-6.822-6.407a1.226 1.226 0 0 0-.608.113v-.004a1.133 1.133 0 0 0-.561.818a.848.848 0 0 0 .117.556l1.484 2.255a2.851 2.851 0 0 1 1.247-2.159c.048-.03.096-.051.143-.073c.032-.014.065-.03.098-.047a.994.994 0 0 1-.655-.372l-.619-.8a.938.938 0 0 1-.061-.089a1.226 1.226 0 0 0-.585-.198Zm-2.288 3.25a1.98 1.98 0 0 0-.52.235l.003-.004a1.309 1.309 0 0 0-.208 1.318c.127.244.221.42.293.556l.007.012l1.405 2.112c.11-.581.378-1.121.774-1.56l-1.754-2.669Zm-.005 9.765l3.428 5.6l.003-.004a6.176 6.176 0 0 0 5.147 2.438a7.427 7.427 0 0 1-1.256-1.367l-3.506-5.723l-1.481-2.5a.99.99 0 0 1-1.3-.31L7.2 15.063a1.73 1.73 0 0 0-.6.278a1.443 1.443 0 0 0-.249 1.392l2.5 4.22Zm12.77 7.933a6.311 6.311 0 0 0 4.397-.725l.003-.004a6.416 6.416 0 0 0 2.937-5.705V12.95a1.3 1.3 0 0 0-1.437-1.17a1.045 1.045 0 0 0-1.02.947c.388.697.71 1.271.869 1.546a1 1 0 0 1-1.73 1a148.45 148.45 0 0 1-.939-1.67l-.071-.127v-.06c-.004-.008-.01-.013-.015-.02c-.006-.007-.013-.014-.018-.023l-3-5.359a.937.937 0 0 0-1.71.038l1.024 1.644l.111.18a396.387 396.387 0 0 0 2.318 3.7a1 1 0 0 1-1.679 1.086a456.31 456.31 0 0 1-2.337-3.726l-.857-1.376l-.406-.653l-.013-.02l-.029-.048c-.004-.005-.009-.008-.014-.012a.116.116 0 0 1-.016-.016l-.625-.813a1.261 1.261 0 0 1-.06-.089a.737.737 0 0 0-.478-.193a1.265 1.265 0 0 0-.742.1a1.157 1.157 0 0 0-.571.833a.867.867 0 0 0 .1.537a4.3 4.3 0 0 1 1.267.78c.308.314.58.663.81 1.04c.279.421.594.937.906 1.457c.233.39.464.781.679 1.146l.081.137c.34.573.628 1.058.819 1.354a1 1 0 1 1-1.679 1.091c-.229-.354-.575-.942-.948-1.573l-.139-.236l-.001-.001c-.173-.293-.35-.593-.525-.884c-.308-.515-.606-1-.86-1.385a6.813 6.813 0 0 0-.427-.604h-.001a.533.533 0 0 0-.037-.042a2.331 2.331 0 0 0-.754-.456a1.043 1.043 0 0 1-.217-.056c-.258.03-.505.125-.718.274a1.335 1.335 0 0 0-.219 1.344l.317.59c.421.179.813.421 1.162.718c.269.263.504.558.7.878c.216.33.446.72.669 1.108c.134.233.266.467.393.693l.007.012l.04.072c.293.518.555.981.769 1.312a1 1 0 1 1-1.679 1.086a30.68 30.68 0 0 1-.893-1.524a98.925 98.925 0 0 0-.375-.66a20.3 20.3 0 0 0-.607-1.009a7.214 7.214 0 0 0-.239-.34a1.351 1.351 0 0 0-.117-.138a2.72 2.72 0 0 0-.742-.437a1.025 1.025 0 0 1-.214-.06a1.835 1.835 0 0 0-.737.311a1.47 1.47 0 0 0-.25 1.416l2.524 4.267l3.463 5.658a6.312 6.312 0 0 0 3.78 2.362ZM3.069 7.076L4.8 8.238a.469.469 0 0 1-.209.851l-2.071.27a.464.464 0 0 1-.508-.571l.342-1.432a.473.473 0 0 1 .715-.28Z"/>
  </svg>
);
export const TomDrumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 16 16" fill="#ffffff">
    <path fill="#ffffff" d="M8 1c4.67 0 7 1.31 7 2.92v8.58a.5.5 0 0 1-.02.14c-.282 1.5-3.3 2.45-6.98 2.45c-3.58 0-6.53-.902-6.95-2.33l-.03-.124a.4.4 0 0 1-.02-.139v-8.58c0-1.61 2.33-2.92 7-2.92zm6 4.56c-1.1.77-3.1 1.28-6 1.28s-4.9-.505-6-1.28v6.85c0 .781 2.68 1.68 6 1.68s6-.901 6-1.68zM5.5 8a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-1 0V8.5a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-1 0V8.5a.5.5 0 0 1 .5-.5M8 2c-3.9 0-6 .95-6 1.92s2.1 1.92 6 1.92s6-.95 6-1.92S11.9 2 8 2"/>
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 19V5l14 7-14 7z" />
  </svg>
);

export const StopIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6V6z" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L9.5 8.5 3 10l5.5 4.5L6 22l6-4.5L18 22l-2.5-7.5L21 10l-6.5-1.5L12 2zm0 4.24L13.24 10h3.52l-2.83 2.33L15.06 16l-3.06-2.04L9 16l1.13-3.67L7.24 10h3.52L12 6.24z"/>
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z"/>
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
  </svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const MidiFileIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z" />
  </svg>
);

export const WaveFileIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 11h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4-4h2v10h-2V7zm4 2h2v6h-2V9zM3 9h2V7H3v2zm4 0h2V7H7v2zm4 0h2V7h-2v2z" />
  </svg>
);

export const PlusCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const MinusCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
