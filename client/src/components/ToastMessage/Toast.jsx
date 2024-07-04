import React, { useEffect } from 'react'
import { LuCheck } from 'react-icons/lu'
import { MdDeleteOutline } from 'react-icons/md'

function Toast({ showToast, message, type, onClose }) {

    useEffect(() => {
        if (showToast) {
            const timeoutId = setTimeout(() => {
                onClose();
            }, 3000);
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [showToast, onClose]);

    return (
        <div className={`fixed top-20 right-6 transition-all duration-400 transform ${showToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'} z-50`}>
            <div className={`min-w-52 bg-white border shadow-2xl rounded-md relative after:w-[5px] after:h-full ${type === "delete" ? "after:bg-red-500" : "after:bg-green-500"} after:absolute after:left-0 after:top-0 after:rounded-l-lg`}>
                <div className='flex items-center gap-3 py-2 px-4'>
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${type === "delete" ? "bg-red-50" : "bg-green-50"}`}>
                        {type === 'delete' ? <MdDeleteOutline className='text-xl text-red-500' /> : <LuCheck className="text-xl text-green-500" />}
                    </div>
                    <p className='text-sm text-slate-800'>{message}</p>
                </div>
            </div>
        </div>
    );
}

export default Toast;
