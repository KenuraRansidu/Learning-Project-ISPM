import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { backendUrl } from "../App";

const CertificateRequests = () => {
  const [requests, setRequests] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/certificate_request");

      if (Array.isArray(data) && data.length > 0) {
        setRequests(data.reverse());
      } else {
        setRequests([]);
        toast.error("No requests found");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch certificate requests");
    }
  };

  const handleDelete = async (requestId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this request?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`${backendUrl}/api/educator/certificate-request/${requestId}`);
    toast.success("Request deleted");
    setRequests(prev => prev.filter(req => req._id !== requestId));
  } catch (error) {
    toast.error("Failed to delete request");
  }
};


  const handleAction = async (requestId, action) => {
  const confirmMessage =
    action === "approve"
      ? "Are you sure you want to approve this certificate request?"
      : "Are you sure you want to decline this certificate request?";

  if (!window.confirm(confirmMessage)) return;

  try {
    const { data } = await axios.post(
      `${backendUrl}/api/educator/${action}-certificate`,
      { requestId }
    );

    if (data.success) {
      toast.success(data.message);
      setRequests(prev =>
        prev.map(req =>
          req._id === requestId
            ? { ...req, status: action === "approve" ? "approved" : "rejected" }
            : req
        )
      );
    } else {
      toast.error(data.message || "Action failed");
    }
  } catch (error) {
    toast.error("Action failed");
  }
};


  useEffect(() => {
    fetchRequests();
  }, []);

  return requests ? (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-6">Certificate Requests</h1>
      <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="text-left text-gray-700 border-b">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Requested On</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {requests.map((req, index) => (
              <tr key={req._id} className="border-b">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{req.student_name || 'N/A'}</td>
                <td className="px-4 py-3">{req.course_name || req.course_id || 'N/A'}</td>
                <td className="px-4 py-3">{req.progress ? `${req.progress}%` : '0%'}</td>
                <td className="px-4 py-3">
                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3 capitalize">
                  <span
                    className={`inline-block px-2 py-1 rounded text-white text-xs ${
                      req.status === "approved"
                        ? "bg-green-500"
                        : req.status === "rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {req.status || "pending"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => handleAction(req._id, "approve")}
                    disabled={req.status === "approved"}
                    className={`px-3 py-1 text-white rounded ${
                      req.status === "approved"
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "decline")}
                    disabled={req.status === "rejected"}
                    className={`px-3 py-1 text-white rounded ${
                      req.status === "rejected"
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    Decline
                  </button>
                  <button
                  onClick={() => handleDelete(req._id)}
                  className="px-3 py-1 text-white bg-gray-600 hover:bg-gray-700 rounded"
                  >
                  Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default CertificateRequests;
