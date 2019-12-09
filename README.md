# secret-santa

## Overview
This is a quick website for running a secret santa in which not all participants know each other.
Essentially this problem reduces to finding a perfect matching in a bipartie graph.
This problem is solved via a third-party npm package.

This website was thrown together in one evening so is not the most user-friendly package.
Moreover, nice-to-have features such as password reset are not included.
The process also requires a certain level of trust in the participants.

## Setup
To setup the site, you must edit the `index.js` file.
Change the `people` object array so that all participants are included.
Make sure names are unique.
Then simply run `npm install` and `npm run start`.
This will create the JSON database and startup the website.

Once everybody has submitted their forms, the matching will be computed and people can log back in with their passwords to collect their recipient's name.

This could be run on a Digital Ocean droplet alongside a dynamics DNS service.

## Testing

Moreover, you can test to make sure that every recipient will receive a present by running `npm run test`.
This will output an ordered arrray of recipient IDs which you must check manually.
This could (and perhaps should) be automated in the future.
