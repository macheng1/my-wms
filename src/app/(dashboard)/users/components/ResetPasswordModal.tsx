import React, { useState } from "react";
import { Modal, Toast } from "@douyinfe/semi-ui-19";

interface ResetPasswordModalProps {
  visible: boolean;
  username?: string;
  userId: string;
  onOk: (newPassword: string) => Promise<void>;
  onCancel: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  username,
  userId,
  onOk,
  onCancel,
}) => {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOk = async () => {
    if (!password || password.length < 6) {
      setErrorMsg("密码至少6位");
      return;
    }
    setLoading(true);
    try {
      await onOk(password);
      Toast.success("重置成功");
      setPassword("");
      setErrorMsg("");
      onCancel();
    } catch (e: any) {
      setErrorMsg(e.message || "重置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`重置【${username || userId}】密码`}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okButtonProps={{ loading }}
    >
      <input
        type={showPwd ? "text" : "password"}
        placeholder="请输入新密码，至少6位"
        style={{ width: "100%", marginBottom: 8 }}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrorMsg("");
        }}
      />
      <label style={{ fontSize: 12, cursor: "pointer" }}>
        <input
          type="checkbox"
          style={{ marginRight: 4 }}
          checked={showPwd}
          onChange={(e) => setShowPwd(e.target.checked)}
        />
        显示密码
      </label>
      {errorMsg && <div style={{ color: "red", fontSize: 12 }}>{errorMsg}</div>}
    </Modal>
  );
};

export default ResetPasswordModal;
