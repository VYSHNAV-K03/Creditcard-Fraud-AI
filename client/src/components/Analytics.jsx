// Analytics.js
import React from "react";

const Analytics = ({ organisers }) => {
  const totalOrganisers = organisers.length;
  const verifiedCount = organisers.filter((org) => org.isVerified).length;
  const unverifiedCount = totalOrganisers - verifiedCount;

  return (
    <div className="analytics my-4 p-3 border rounded shadow-sm">
      <h5 className="text-center">Business Analytics</h5>
      <div className="row text-center">
        <div className="col">
          <h6>Total Users</h6>
          <p className="display-4">{totalOrganisers}</p>
        </div>
        <div className="col">
          <h6>Verified Users</h6>
          <p className="display-4 text-success">{verifiedCount}</p>
        </div>
        <div className="col">
          <h6>Unverified Users</h6>
          <p className="display-4 text-danger">{unverifiedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
