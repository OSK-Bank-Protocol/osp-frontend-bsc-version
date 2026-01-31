import axios from 'axios';
import { APP_ENV } from './environment';

const SUBGRAPH_URLS = {
  dev: 'https://api.studio.thegraph.com/query/16009/osp-referral-test/version/latest',
  test: 'https://api.studio.thegraph.com/query/16009/osp-referral-test/version/latest',
  PROD: 'https://gateway.thegraph.com/api/subgraphs/id/BsRRxXvd4kYNxCfAhPqTg4LoA1RJyaAJQu93GG7stu1v'
};

const PROD_API_KEY = '59ea243e4cb1078db41167f3fb142843';

// Query for referrals
const GET_USER_DIRECT_REFERRALS = `
  query GetUserDirectReferrals($userAddress: ID!) {
    user(id: $userAddress) {
      id
      referralCount
      referrals(
        orderBy: createdAtTimestamp,
        orderDirection: desc
      ) {
        id
        referralCount
        createdAtTimestamp
        createdAtTransaction
      }
    }
  }
`;

export const getReferrals = async (userAddress) => {
  if (!userAddress) return null;
  
  const url = SUBGRAPH_URLS[APP_ENV] || SUBGRAPH_URLS.dev;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (APP_ENV === 'PROD') {
    headers['Authorization'] = `Bearer ${PROD_API_KEY}`;
  }

  try {
    const response = await axios.post(url, {
      query: GET_USER_DIRECT_REFERRALS,
      variables: {
        userAddress: userAddress.toLowerCase()
      }
    }, {
      headers
    });

    if (response.data.errors) {
      console.error('Subgraph errors:', response.data.errors);
      return null;
    }

    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching referrals from subgraph:', error);
    return null;
  }
};

