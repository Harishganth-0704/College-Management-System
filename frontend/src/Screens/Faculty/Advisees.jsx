import React, { useEffect, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";

const Advisees = () => {
  const [advisees, setAdvisees] = useState([]);

  useEffect(() => {
    const fetchAdvisees = async () => {
      try {
        const { data } = await axiosWrapper.get("/faculty/advisees", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        if (data.success) {
          setAdvisees(data.data || data.advisees || []); // Handle standard response
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load advisees");
      }
    };
    fetchAdvisees();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Advisees</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrollment No</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CGPA</th>
            </tr>
          </thead>
          <tbody>
            {advisees.length > 0 ? (
              advisees.map((student) => (
                <tr key={student._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.enrollmentNo}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {`${student.firstName} ${student.lastName}`}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.email}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.phone}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-semibold">
                    {student.currentCGPA || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-5 text-center text-gray-500">
                  No advisees assigned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Advisees;
