'use client';

import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import { redirect, useRouter } from 'next/navigation';
import { useFeedback } from '@/context/FeedbackContext';
import { getRequest, postRequest } from '@/lib/request';

export default function Page({ searchParams }: {
    searchParams: { id: string };
}) {

    const router = useRouter();
    const id = searchParams.id;
    if (!id) {
        redirect('/404');
    }
    const [plate, setPlate] = useState('');
    const [phone, setPhone] = useState('');

    const { showToast, showLoading, hideLoading } = useFeedback();

    useEffect(() => {
        const plateData = JSON.parse(localStorage.getItem(id) || '');
        if (!plateData) {
            showLoading();
            getRequest('/api/notify/info?id=' + id).then(data => {
                setPlate(data.plate);
                setPhone(data.phone);
                localStorage.setItem(id, JSON.stringify(data));
                // hideLoading();
            }).catch(err => {
                console.log(err);
                hideLoading();
                // router.push('/404');
            });
        } else {
            const { plate, phone } = plateData;
            setPlate(plate);
            setPhone(phone);
        }
    }, []);

    const notifyOwner: React.MouseEventHandler<HTMLButtonElement> = () => {
        showLoading();
        postRequest('/api/notify/send', { id }).then(data => {
            hideLoading();
            showToast('发送成功');
        }).catch(err => {
            hideLoading();
            showToast('通知发送失败');
        });
    };

    const callOwner = () => {

        if (phone) {
            window.location.href = 'tel:' + phone;
            return;
        }
        showLoading();
        postRequest('/api/notify/call', { id }).then(data => {
            router.push('/rtc?token=' + data);
        }).catch(err => {
            hideLoading();
            showToast(err.message);
        });
    };

    return (
        <main className={styles.main} data-lk-theme="default">
            {/*<h1>通知车主挪车</h1>*/}
            {plate &&
                (<div className={styles.plate}>
                    <span>{plate?.charAt(0)}</span><span>{plate?.charAt(1)}</span><span>•</span><span>{plate?.slice(2)}</span>
                </div>)}

            <p>临时停靠，请多关照</p>
            <button className={styles.notifyBtn} onClick={notifyOwner}>
                通知车主挪车
            </button>
            <button className={styles.callBtn} onClick={callOwner}>
                拨打车主电话
            </button>
        </main>
    );
}
