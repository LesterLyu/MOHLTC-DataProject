
const config = {
  dev: {
    server: 'http://localhost:3000',
  },
  prod: {
    server: process.env.SERVER_URL || 'http://ec2-3-16-106-158.us-east-2.compute.amazonaws.com',
  }
};
export default process.env.NODE_ENV === 'production' ? config.prod : config.dev;


