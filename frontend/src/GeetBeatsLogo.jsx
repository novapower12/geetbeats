export default function GeetBeatsLogo({ className = "h-8" }) {
    return (
      <div className="inline-flex items-center select-none" aria-label="GeetBeats">
        <svg
          viewBox="0 0 268 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Left eighth-note head + stem + flag */}
          <ellipse
            cx="18"
            cy="49"
            rx="11"
            ry="8.5"
            transform="rotate(-18 18 49)"
            fill="#0B0F19"
          />
          <path
            d="M27.5 47V14C27.5 11.8 29.2 10 31.4 10H36.5V16.5H34V47H27.5Z"
            fill="#0B0F19"
          />
  
          {/* Right eighth-note head + stem + flag forming the 'G' */}
          <ellipse
            cx="43"
            cy="52"
            rx="11.5"
            ry="8.8"
            transform="rotate(-18 43 52)"
            fill="#0B0F19"
          />
          <path
            d="M52.8 50V14C52.8 11.8 54.5 10 56.7 10H62V16.5H59.5V50C59.5 55.5 55.2 60 49.5 60H44.5V54.2H49C51.2 54.2 52.8 52.5 52.8 50Z"
            fill="#0B0F19"
          />
  
          {/* Bold lowercase 'eetbeats' matching the rounded geometric style */}
          <text
            x="65"
            y="53"
            fill="#0B0F19"
            fontFamily="ui-rounded, 'SF Pro Rounded', 'Nunito', 'Poppins', 'Segoe UI', sans-serif"
            fontWeight="900"
            fontSize="43"
            letterSpacing="-1.5"
          >
            eetbeats
          </text>
        </svg>
      </div>
    );
  }