export const convertTime = (time) =>
  `${parseInt(time / 60)}:${(time % 60 <= 9 ? "0" : "") + (time % 60)}`;
