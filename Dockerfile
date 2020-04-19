FROM node:12

# Installing dependencies
ADD yarn.lock .
ADD package.json .
ADD web/yarn.lock web/yarn.lock
ADD web/package.json web/package.json
ADD api/yarn.lock api/yarn.lock
ADD api/package.json api/package.json
RUN yarn

# Building the app
ADD . .
RUN test -f api/.env || \
    (echo "Please create api/.env (see api/.env.example)" && exit 1)
RUN test -f api/database/vox-questions.json || \
    (echo "Please create api/database/vox-questions.json (see api/database/vox-questions.json.example)" && exit 1)
RUN test -f api/database/vox-answers.json || \
    (echo "Please create api/database/vox-answers.json (see api/database/vox-answers.json.example)" && exit 1)
RUN yarn deploy

EXPOSE 3001
CMD yarn serve
