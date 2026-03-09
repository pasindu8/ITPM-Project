import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';


function EquipmentInventory() {
  const [studentNames, setStudentNames] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addItem, setAddItem] = useState(false);
  const [assigntab, showAssigntab] = useState(false);
  const [assignedItemData, setAssignedItemData] = useState([]);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:5000/inventory/all', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          }
        }); 
        const result = await res.json();
        if (res.ok) {
          setItemData(result.data);
        } else {
          console.error("Failed to fetch stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false); 
        }
    };
    fetchStats();

    const fetchAssignedItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:5000/inventory/assigned', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          }
        }); 
        const result = await res.json();
        if (res.ok) {
          setAssignedItemData(result.data);
        } else {
          console.error("Failed to fetch stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedItems();
  }, []);




  async function addItemSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');

    const formData = {
      ItemName: event.target.ItemName.value,
      Quantity: event.target.Quantity.value,
      Condition: event.target.Condition.value
    };

    try {
      const res = await fetch('http://localhost:5000/inventory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}` 
        },
        body: JSON.stringify(formData), 
      });

      const resultaddItem = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultaddItem.message || 'Failed to add item'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Item added successfully'
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the item'
      });
    }
  }

  async function handleEditItem(itemId) {
    const itemToEdit = itemData.find(item => item._id === itemId);
    if (!itemToEdit) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Item not found'
      });
      return;
    }

    const token = localStorage.getItem('token');

    const { value: formValues } = await Swal.fire({
      title: 'Edit Inventory Item',
      html: `
        <input type="text" id="ItemName" class="swal2-input" placeholder="Item Name" value="${itemToEdit.ItemName}">
        <input type="number" id="Quantity" class="swal2-input" placeholder="Quantity" value="${itemToEdit.Quantity}">
        <select id="Condition" class="swal2-input">
          <option value="New" ${itemToEdit.Condition === 'New' ? 'selected' : ''}>New</option>
          <option value="Good" ${itemToEdit.Condition === 'Good' ? 'selected' : ''}>Good</option>
          <option value="Fair" ${itemToEdit.Condition === 'Fair' ? 'selected' : ''}>Fair</option>
        </select>
      `,
      confirmButtonText: 'Save',
      focusConfirm: false,
      preConfirm: () => {
        const ItemName = Swal.getPopup().querySelector('#ItemName').value;
        const Quantity = Swal.getPopup().querySelector('#Quantity').value;
        const Condition = Swal.getPopup().querySelector('#Condition').value;

        if (!ItemName || !Quantity || !Condition) {
          Swal.showValidationMessage('Please fill in all fields');
        }

        return { ItemName, Quantity, Condition };
      }
    });

    if (formValues) {
      try {
        const res = await fetch(`http://localhost:5000/inventory/update/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify(formValues),
        });

        const result = await res.json();

        if (!res.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'Failed to update item'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Item updated successfully'
            }).then(() => {
            window.location.reload();
          });
        }
      } catch (error) {
        console.error("Error updating item:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the item'
        });
      }
    }
  }

  async function studentNameList() {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/inventory/students', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          }
      });
      const result = await res.json();

      if (!res.ok) {
        console.error("Error fetching student names:", result.message);
      } else {
        setStudentNames(result.data);
      }
    } catch (error) {
      console.error("Error fetching student names:", error);
    }
  }

  async function assignItemSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const formData = {
      studentName: event.target.studentName.value,
      ItemName: event.target.ItemName.value,
      Quantity: event.target.Quantity.value,
      status: event.target.status.value,
      ItemId: itemData.find(item => item.ItemName === event.target.ItemName.value)._id
    };

    try {
      const res = await fetch('http://localhost:5000/inventory/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Failed to assign item'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Item assigned successfully'
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error assigning item:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while assigning the item'
      });
    }
  }



  if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

  return (
    <div 
      className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />

      {/* --- Main Content Section --- */}
      <div className="flex-1 flex flex-col gap-6 overflow-auto px-2">
        
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">📦 Equipment & Inventory</h2>
            <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Manage team gear and distribution</p>
          </div>
          <div className="flex gap-2">
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-sm"
             onClick={() => setAddItem(true)}>
              + Add Item
             </button>
          </div>
        </div>




        {!addItem && !assigntab && (
            <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- Inventory Stock Table --- */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 px-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Current Stock Levels
            </h3>
            <div className="overflow-x-auto">
              {itemData && itemData.length > 0 ? (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-white/40 text-[10px] uppercase tracking-widest font-black">
                    <th className="px-4 pb-2">Item Name</th>
                    <th className="px-4 pb-2">Total</th>
                    <th className="px-4 pb-2">Available</th>
                    <th className="px-4 pb-2">Condition</th>
                    <th className="px-4 pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {itemData.map((item) => (
                    <tr key={item._id} className="bg-white/5 hover:bg-white/10 transition-colors group">
                      <td className="p-4 rounded-l-2xl font-bold text-sm">{item.ItemName}</td>
                      <td className="p-4 text-sm">{item.Quantity}</td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${item.available < 3 ? 'text-red-400' : 'text-green-400'}`}>{item.available}</span>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.available/item.Quantity)*100}%` }}></div>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase font-bold border border-white/10">{item.Condition}</span>
                      </td>
                      <td className="p-4 rounded-r-2xl text-center">
                        <button onClick={() => handleEditItem(item._id)}
                        className="text-white/40 hover:text-white transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : (
                <p className="text-white/50 text-center py-10">No inventory items found. Please add new items.</p>
              )}
            </div>
          </div>

          {/* --- Distribution / Hand-over List --- */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col">
            <h3 className="text-white font-bold mb-6 px-2">Assignments</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {assignedItemData.map((asgn) => (
                <div key={asgn._id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 relative group overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1 h-full ${asgn.status === 'Handed Over' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold text-sm">{asgn.studentName}</h4>
                    <span className="text-[10px] text-white/40 font-mono">{asgn.date}</span>
                  </div>
                  <p className="text-white/60 text-xs italic">Borrowed: {asgn.ItemNames}</p>
                  <p className="text-white/50 text-xs">Quantity: <span className="text-white font-bold">{asgn.Quantity}</span></p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${asgn.status === 'Handed Over' ? 'text-yellow-400 bg-yellow-400/10' : 'text-green-400 bg-green-400/10'}`}>
                      {asgn.status}
                    </span>
                    <button className="text-[10px] text-blue-300 font-bold hover:underline">Update Status</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => {
              studentNameList();
              showAssigntab(true);
            }} className="w-full mt-6 py-3 bg-white text-blue-900 font-bold rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95">
               Assign New Item
            </button>
          </div>

        </div>
        </>)}



        {!addItem && !assigntab && (
          <>
        {/* Maintenance Alert */}
        {itemData && itemData.filter((item) => item.Condition === 'Fair').length > 0 ? (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
           <div className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center animate-bounce">⚠️</div>
           <div>
              <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider">Maintenance Required</h4>
              <p className="text-white/70 text-sm">
              {itemData.filter((item) => item.Condition === 'Fair').length} Practice 
              {itemData?.filter((item) => item.Condition === 'Fair').map((item) => (
                <span key={item._id}> {item.ItemName}, </span>
              ))}
              Nets are in "Fair" condition. Recommend repair before next tournament.</p>
           </div>
        </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
             <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center animate-pulse">✅</div>
              <div>
                  <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider">All Equipment in Good Condition</h4>
                  <p className="text-white/70 text-sm">No maintenance required at this time. Keep up the great work!</p>
              </div>
          </div>
        )}
        </>
        )}



        {addItem && !assigntab && (
          <>
            <center>
            <div className="w-[450px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col">
            <h3 className="text-white font-bold mb-6 px-2">Add Inventory Item</h3>
            <form onSubmit={addItemSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <input type="text" name="ItemName" placeholder="Item Name" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" /><br />
              <input type="number" name="Quantity" placeholder="Quantity" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" /><br />
              <select name="Condition" className="w-full p-3 rounded-xl bg-black/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="" disabled selected>Condition</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
              <div className="flex justify-end gap-4 mt-4">
                <button className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all" onClick={() => setAddItem(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                  Add Item
                </button>
              </div>
            </form>
          </div>
          </center>
          </>
          )}



        {assigntab && !addItem && (
          <>
            <center>
            <div className="w-[450px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col">
            <h3 className="text-white font-bold mb-6 px-2">Assign Item to Student</h3>
            <form onSubmit={assignItemSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              
              <select name="studentName" className="w-full p-3 rounded-xl bg-black/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="" disabled selected>Student Name</option>  
                
                {studentNames.map((student) => (
                  <option key={student._id} value={student.name} className='text-black'>{student.name}</option>
                ))}
              </select>

              <select name="ItemName" className="w-full p-3 rounded-xl bg-black/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="" disabled selected>Item Name</option>
                {itemData.map((item) => (
                  <option key={item.ItemName} value={item.ItemName} className='text-black'>{item.ItemName}</option>
                ))}
              </select> <br />

              <input type='number' name='Quantity' placeholder='Quantity' className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />

              <select name="status" className="w-full p-3 rounded-xl bg-black/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="" disabled selected>Status</option>
                <option value="Handed Over" className='text-black'>Handed Over</option>
                <option value="Returned" className='text-black'>Returned</option>
              </select>
              
              <div className="flex justify-end gap-4 mt-4">
                <button className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all" onClick={() => showAssigntab(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                  Assign Item
                </button>
              </div>
            </form>
          </div>
          </center>
          </>
          )}
      </div>
    </div>
  );
  
}

export default EquipmentInventory;