import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiBookOpen,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiSlash,
  FiAward
} from 'react-icons/fi';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [toggleStatusTarget, setToggleStatusTarget] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getUsers();
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectUser = async (id) => {
    try {
      const res = await apiService.getUser(id);
      if (res.data?.success) {
        setSelectedUserDetails(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load user profile');
    }
  };

  const handleToggleUserStatus = async () => {
    if (!toggleStatusTarget) return;
    const newStatus = toggleStatusTarget.status === 'blocked' ? 'active' : 'blocked';
    try {
      await apiService.toggleUserStatus({
        user_id: toggleStatusTarget.user_id,
        status: newStatus,
      });
      toast.success(`User is now ${newStatus}`);
      setToggleStatusTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Customer',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E50914] to-[#7f1d1d] font-black text-white text-sm shadow-[0_0_12px_rgba(229,9,20,0.3)] shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-white block text-xs truncate">{val}</span>
            <span className="text-[11px] text-slate-400 block truncate">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val) => <span className="text-xs text-slate-400">{val || '—'}</span>,
    },
    {
      key: 'total_bookings',
      label: 'Bookings',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-slate-200">
          {val} {Number(val) === 1 ? 'ticket' : 'tickets'}
        </span>
      ),
    },
    {
      key: 'total_spend',
      label: 'Total Spend',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-[#E50914] text-sm">
          ${Number(val).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-400 font-mono">{val?.split(' ')[0]}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        val === 'active' ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Blocked</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInspectUser(row.user_id)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            title="View User Details & History"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setToggleStatusTarget(row)}
            className={`rounded-xl p-2 transition ${
              row.status === 'active'
                ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
            }`}
            title={row.status === 'active' ? 'Block User' : 'Unblock User'}
          >
            {row.status === 'active' ? <FiSlash className="h-4 w-4" /> : <FiUserCheck className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]"></span>
            <span className="text-[10px] font-extrabold text-[#E50914] uppercase tracking-widest">
              COMMUNITY & PATRONS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Customer Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View registered patron profiles, lifetime spending, booking patterns, and account access permissions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="rounded-xl border border-white/[0.08] bg-[#10131E]/95 px-3.5 py-2 text-slate-300">
            Total Patrons: <strong className="text-white ml-1">{users.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <SkeletonLoader rows={6} cols={7} />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Search customer name, email, or phone..."
          searchField="full_name"
          pageSize={10}
          filterableFields={[
            {
              field: 'status',
              label: 'Status',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Blocked', value: 'blocked' },
              ],
            },
          ]}
        />
      )}

      {/* User Details & Booking History Modal */}
      {selectedUserDetails && (
        <Modal
          isOpen={!!selectedUserDetails}
          onClose={() => setSelectedUserDetails(null)}
          title={`Customer Profile: ${selectedUserDetails.full_name}`}
          size="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Header profile info */}
            <div className="flex items-center gap-4 rounded-2xl bg-[#0A0D16] p-4 sm:p-5 border border-white/[0.08]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E50914] to-[#7f1d1d] text-white font-extrabold text-xl shadow-[0_0_20px_rgba(229,9,20,0.35)] shrink-0">
                {selectedUserDetails.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-white truncate">
                    {selectedUserDetails.full_name}
                  </h4>
                  {selectedUserDetails.status === 'active' ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="danger">Blocked</Badge>
                  )}
                </div>
                <p className="mt-1 text-slate-400">
                  {selectedUserDetails.email} {selectedUserDetails.phone ? `• ${selectedUserDetails.phone}` : ''}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Member since {selectedUserDetails.created_at?.split(' ')[0]}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D16] p-4 text-center">
                <span className="text-slate-400 text-xs">Lifetime Bookings</span>
                <p className="mt-1 text-2xl font-black text-white">
                  {selectedUserDetails.total_bookings || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D16] p-4 text-center">
                <span className="text-slate-400 text-xs">Lifetime Box Office Spend</span>
                <p className="mt-1 text-2xl font-black text-[#E50914]">
                  ${Number(selectedUserDetails.total_spend || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Booking History Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-white">Booking History</h5>
                <span className="text-[11px] text-slate-500">All recorded reservations</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {selectedUserDetails.bookings && selectedUserDetails.bookings.length > 0 ? (
                  selectedUserDetails.bookings.map((b) => (
                    <div
                      key={b.booking_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0A0D16] hover:border-white/[0.15] transition"
                    >
                      <div>
                        <span className="font-bold text-white block">
                          #{b.booking_id} • {b.movie_title}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {b.cinema_name} • {b.show_date} at {b.start_time?.substring(0, 5)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-white block">
                          ${Number(b.total_amount).toFixed(2)}
                        </span>
                        <span className="text-[10px] capitalize text-[#E50914] font-bold">
                          {b.booking_status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-6 border border-dashed border-white/[0.08] rounded-xl">
                    No bookings found for this customer.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(229,9,20,0.35)] hover:brightness-110 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Block / Unblock Confirmation */}
      <ConfirmDialog
        isOpen={!!toggleStatusTarget}
        onClose={() => setToggleStatusTarget(null)}
        onConfirm={handleToggleUserStatus}
        title={toggleStatusTarget?.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
        message={`Are you sure you want to ${
          toggleStatusTarget?.status === 'active' ? 'block' : 'unblock'
        } ${toggleStatusTarget?.full_name}? ${
          toggleStatusTarget?.status === 'active'
            ? 'The customer will not be able to log in or book tickets.'
            : 'Access will be restored.'
        }`}
        confirmText={toggleStatusTarget?.status === 'active' ? 'Block User' : 'Unblock User'}
        confirmVariant={toggleStatusTarget?.status === 'active' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default Users;
