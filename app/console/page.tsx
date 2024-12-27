'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { delRequest, getRequest, postRequest } from '@/lib/request';
import styles from '../../styles/Console.module.css';
import { useFeedback } from '@/context/FeedbackContext';

interface CarInfo {
    id: string;
    plate: string;
    phone?: string;
    notifyId: string;
    notifyToken: string;
}

interface NotifyType {
    id: string;
    name: string;
    tips: string;
}

export default function ConsolePage({}) {

    const [carsList, setCarsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CarInfo | null>(null);
    const [notifyTypes, setNotifyTypes] = useState<NotifyType[]>([]);


    const { showToast, showLoading, hideLoading } = useFeedback();

    const listCars = useCallback(() => {
        getRequest('/api/admin/cars').then(data => {
            setCarsList(data);
        }).catch(err => {
            console.log(err);
        });
    }, []);

    const listNotifyTypes = useCallback(() => {
        getRequest('/api/admin/notifyTypes')
            .then(data => {
                setNotifyTypes(data || []);
            }).catch(err => console.error(err));
    }, []);


    useEffect(() => {
        listCars();
        listNotifyTypes();
    }, []);

    const filteredItems = carsList.filter((item: CarInfo) =>
        item.plate?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleDelete = (id: string) => {
        if (!id) {
            return;
        }
        showLoading();
        delRequest('/api/admin/cars?id=' + id)
            .then(data => {
                listCars();
                hideLoading();
            })
            .catch(err => {
                console.log(err);
                hideLoading();
                showToast(err.message);
            });
    };

    const handleEdit = (item: CarInfo) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedItem(null); // 清空选中的项，表示新增
        setIsModalOpen(true);
    };

    const handleSubmit = (carInfo: CarInfo) => {
        if (!carInfo.notifyId || !carInfo.notifyToken) {
            showToast('通知类型不能为空');
            return;
        }
        showLoading();
        const func = selectedItem ? 'updateCar' : 'addCar';
        postRequest(`/api/admin/${func}`, carInfo).then(data => {
            setIsModalOpen(false);
            listCars();
            hideLoading();
        }).catch(err => {
            console.error(err);
            hideLoading();
            showToast(err.message);
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <input
                    type='text'
                    placeholder='输入车牌号'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <button onClick={handleAdd} className={styles.addButton}>新增车牌</button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>id</th>
                        <th>车牌</th>
                        <th>手机号</th>
                        <th>通知类型</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredItems.map((item: CarInfo) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.plate}</td>
                            <td>{item.phone || '-'}</td>
                            <td>{notifyTypes.find((e: NotifyType) => e.id === item.notifyId)?.name || '-'}</td>
                            <td className={styles.tableActions}>
                                <button className={styles.editBtn} onClick={() => handleEdit(item)}>编辑</button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>删除</button>
                                <a className={styles.previewBtn} target='_blank'
                                   href={`${window.location.protocol}//${window.location.host}?id=${item.id}`}>预览
                                </a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit */}
            {notifyTypes.length > 0 && (<Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                notifyTypes={notifyTypes}
                item={selectedItem || undefined} // 传递当前编辑项或没有项表示新增
            />)}
        </div>
    );

}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (carInfo: CarInfo) => void;
    item?: CarInfo; // 编辑时传递已有的项
    notifyTypes: NotifyType[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, item, notifyTypes }) => {

    const defaultItem = useMemo((): CarInfo => {
        return {
            id: '',
            plate: '',
            phone: '',
            notifyId: notifyTypes.length > 0 ? notifyTypes[0].id : '',
            notifyToken: '',
        };
    }, []);

    const [formData, setFormData] = useState(item || defaultItem);


    useEffect(() => {
        setFormData(item || defaultItem);
    }, [item]);

    if (!isOpen) return (<></>);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>{item ? '编辑' : '新增'}</h3>
                <form onSubmit={handleSubmit}>
                    {item && (<div className={styles.inputGroup}>
                        <label>id</label>
                        <input readOnly={true} value={formData.id} />
                    </div>)}
                    <div className={styles.inputGroup}>
                        <label>车牌号</label>
                        <input
                            type='text'
                            name='plate'
                            value={formData.plate}
                            onChange={handleChange}
                            required={true}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>手机号</label>
                        <input
                            type='text'
                            name='phone'
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>通知类型</label>
                        <select value={formData.notifyId} onChange={handleChange} name='notifyId'>
                            {notifyTypes.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    {formData.notifyId &&
                        <>
                            <div className={styles.inputGroup}>
                                <label>token</label>
                                <input
                                    required={true}
                                    type='text'
                                    name='notifyToken'
                                    value={formData.notifyToken}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <span>{notifyTypes.find((item: NotifyType) => item.id === formData.notifyId)?.tips || '-'}</span>
                            </div>
                        </>
                    }
                    <div className={styles.actions}>
                        <button type='submit'>{item ? '保存' : '添加'}</button>
                        <button type='button' onClick={onClose}>取消</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


