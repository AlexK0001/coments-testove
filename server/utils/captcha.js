import svgCaptcha from 'svg-captcha';

export const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 2,
    color: true,
    background: '#ccf2ff',
  });

  return {
    data: captcha.data,
    text: captcha.text.toLowerCase(),
  };
};
