"use client";
import Card from "../../../../components/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfigDialog from "../../../../components/ConfirmDialog";

export default function AdminBlogs() {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // Track the delete type (blog/comment)
  const [searchTerm, setSearchTerm] = useState("");

  // State for replying to comments
  const [replyComment, setReplyComment] = useState(null);
  const [replyText, setReplyText] = useState("");

  const onAddNew = () => {
    router.push("/admin/blogs/form");
  };

  const onConfirmDelete = (id) => {
    setDeleteId(id);
    setDeleteType("blog"); // Set the type to blog
    setIsOkOnly(false);
    setModalTitle("Confirm");
    setModalMessage("Are you sure you want to delete this blog?");
    setModal(true);
  };
  const onCancel = () => {
    setModal(true);
  };

  const onConfirmCommentDelete = (commentId) => {
    setDeleteId(commentId); // Directly set commentId for deletion
    setDeleteType("comment");
    setModalTitle("Confirm");
    setIsOkOnly(false);
    setModalMessage("Are you sure you want to delete this comment?");
    setModal(true);
  };

  const onConfirmOk = async () => {
    try {
      if (deleteType === "comment") {
        const res = await fetch(`/api/comment/commentId/${deleteId}`, {
          method: "DELETE",
        });
        let responseData = await res.json();
      } else {
        const res = await fetch(`/api/blogs/${deleteId}`, {
          method: "DELETE",
        });
        let responseData = await res.json();
      }
      setModal(true);
      setModalMessage(`Data has been successfully deleted.`);
      setModalTitle("Info");
      setIsOkOnly(true);
      fetchData();

      // Close the modal after successful delete
      setModal(false);
    } catch (err) {
      console.error("ERR", err.message);
      setModal(true);
      setModalTitle("Err");
      setModalMessage(err.message);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/blogs");
      let responseData = await res.json();
      setBlogs(responseData.data);
      setFilteredBlogs(responseData.data);

      const commentsData = await Promise.all(
        responseData.data.map(async (blog) => {
          const commentRes = await fetch(`/api/comment/${blog._id}`);
          const commentData = await commentRes.json();
          return { blogTitle: blog.title, comments: commentData.data || [] };
        })
      );
      setComments(commentsData);
    } catch (err) {
      console.error("ERR", err.message);
      setModal(true);
      setModalTitle("Err");
      setModalMessage(err.message);
    }
  };

  const gotoEditPage = (id) => {
    router.push(`/admin/blogs/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const results = blogs.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBlogs(results);
  };

  // Function to handle reply action
  const handleReplyClick = (comment) => {
    setReplyComment(comment); // Set the comment you want to reply to
    setReplyText(""); // Clear the reply input field
  };

  // Function to handle the form submission for the reply
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    const replycommentId = replyComment._id; // Ensure this is the correct comment ID

    try {
      const response = await fetch(`/api/reply-comment/${replycommentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply: replyText }), // Update this to send 'reply' instead of 'replyText'
      });

      const result = await response.json();

      if (result.success) {
        alert("Reply added successfully!");
        setReplyText(""); // Clear the reply input field
      } else {
        alert("Error adding reply: " + result.message);
      }
    } catch (error) {
      console.error("Error while submitting reply:", error);
      alert("Error submitting reply: " + error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Card title="Blogs" style="mt-5" showAddBtn onAddNew={onAddNew}>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="table-head border-blue-gray-100">No</th>
              <th className="table-head border-blue-gray-100">Title</th>
              <th className="table-head border-blue-gray-100">Sub Title</th>
              <th className="table-head border-blue-gray-100">
                Category Blogs
              </th>
              <th className="table-head border-blue-gray-100">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.map((item, key) => (
              <tr key={key} className="border-b border-blue-gray-50">
                <td className="p-2 text-center">{key + 1}</td>
                <td className="p-2 text-center">{item.title}</td>
                <td className="p-2 text-center">{item.subTitle}</td>
                <td className="p-2 text-center">{item.kategori}</td>
                <td className="p-2 text-center">
                  <div className="inline-flex text-[12px]">
                    <button
                      onClick={() => gotoEditPage(item._id)}
                      className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onConfirmDelete(item._id)}
                      className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Comments" style="mt-5">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="table-head border-blue-gray-100">No</th>
              <th className="table-head border-blue-gray-100">Blog Title</th>
              <th className="table-head border-blue-gray-100">Name</th>
              <th className="table-head border-blue-gray-100">Comment</th>
              <th className="table-head border-blue-gray-100">Action</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((item, index) => {
              return item.comments?.map((comment, key) => (
                <tr key={key} className="border-b border-blue-gray-50">
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2 text-center">{item.blogTitle}</td>
                  <td className="p-2 text-center">{comment.name}</td>
                  <td className="p-2 text-center">{comment.comment}</td>
                  <td className="p-2 text-center">
                    <div className="inline-flex text-[12px]">
                      <button
                        onClick={() => handleReplyClick(comment)} // Pass the comment you want to reply to
                        className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => onConfirmCommentDelete(comment._id)}
                        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </Card>

      {replyComment && (
        <div className="mt-5 p-4 bg-gray-100 rounded">
          <h3 className="text-xl">Reply to: {replyComment.name}</h3>
          <p>{replyComment.comment}</p>
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="4"
              className="w-full border p-2 mt-2"
              placeholder="Write your reply..."
            />
            <button
              type="submit"
              className="mt-3 bg-blue-500 text-white px-5 py-2 rounded"
            >
              Submit Reply
            </button>
          </form>
        </div>
      )}

      <ConfigDialog
        onOkOny={() => onCancel()}
        showDialog={modal}
        title={modalTitle}
        message={modalMessage}
        onCancel={() => setModal(false)} // Close the dialog on cancel
        onOk={() => onConfirmOk()}
        isOkOnly={isOkOnly}
      />
    </>
  );
}
