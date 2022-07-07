import { QuestionCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { CrossChainStatus } from 'shared/config/constant';
import { HelixHistoryRecord } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TxStatus({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Status')}
      tip={t('The status of the cross-chain transaction: Success, Pending, or Reverted.')}
    >
      <CrossChainState value={record?.result ?? CrossChainStatus.pending} className="relative">
        {record?.result === CrossChainStatus.reverted && record.bridgeDispatchError && (
          <div className="absolute -top-3 -right-3">
            <Tooltip title={record?.bridgeDispatchError}>
              <QuestionCircleFilled className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
        )}
      </CrossChainState>
    </TransferDescription>
  );
}
