import axios from 'axios';

const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/16009/osp-referral-test/version/latest';

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
  
  try {
    const response = await axios.post(SUBGRAPH_URL, {
      query: GET_USER_DIRECT_REFERRALS,
      variables: {
        userAddress: userAddress.toLowerCase()
      }
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

