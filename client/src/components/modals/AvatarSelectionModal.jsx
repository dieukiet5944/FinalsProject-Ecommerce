import React from 'react';
import { Modal, message } from 'antd';

const AvatarSelectionModal = ({ open, onCancel, onSelect, currentPick }) => {
    const sampleAvatars = ['none-avt.png', 'carrick.jpg', 'davidbeckham.png', 'edwin.jpg', 'evra.jpg', 'ronaldo.jpg', 'tevez.jpg', 'vidic.jpg', 'hargo.jpg', 'rio.jpg'];

    return (
        <Modal
            title={<span className="text-base font-bold font-heading">Select Profile Avatar</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={420}
        >
            <div className="grid grid-cols-3 gap-3 pt-3 max-h-87.5 overflow-y-auto pr-1">
                {sampleAvatars.map((avtName) => {
                    const isSelected = currentPick === avtName;

                    return (
                        <div
                            key={avtName}
                            onClick={() => {
                                onSelect(avtName);
                                message.success(`Selected temporary avatar. Click Save to commit.`);
                            }}
                            className={`cursor-pointer border-2 p-1 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm overflow-hidden bg-white ${
                                isSelected
                                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                                    : 'border-gray-200 hover:border-primary-400'
                            }`}
                        >
                            <img
                                src={`/product/avtusers/${avtName}`}
                                alt={avtName}
                                className="w-full aspect-square object-cover rounded-lg"
                            />
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default AvatarSelectionModal;