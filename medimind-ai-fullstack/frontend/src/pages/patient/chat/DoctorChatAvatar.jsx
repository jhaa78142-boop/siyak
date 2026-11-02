import doctorAvatar from "../../../assets/media/Friendly Doctor Healthcare Avatar.png";

export default function DoctorChatAvatar({ className = "" }) {
  return (
    <img
      src={doctorAvatar}
      alt=""
      aria-hidden="true"
      className={`mm-doctor-chat-avatar ${className}`.trim()}
      draggable="false"
    />
  );
}
